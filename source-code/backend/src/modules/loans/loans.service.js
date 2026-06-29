const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');
const settingsService = require('../settings/settings.service');
const { addDays, overdueDays } = require('./loan.rules');

function serialize(loan) {
  return {
    id: loan.id,
    status: loan.status,
    bookId: loan.bookId,
    userId: loan.userId,
    book: loan.book ? { id: loan.book.id, title: loan.book.title, isbn: loan.book.isbn } : undefined,
    user: loan.user ? { id: loan.user.id, fullName: loan.user.fullName } : undefined,
    requestedAt: loan.requestedAt,
    borrowedAt: loan.borrowedAt,
    dueDate: loan.dueDate,
    returnedAt: loan.returnedAt,
    renewalCount: loan.renewalCount,
    fineAmount: loan.fineAmount,
    rejectReason: loan.rejectReason,
  };
}

// FR-27: nếu phiếu BORROWED đã quá hạn thì coi như OVERDUE (đánh dấu khi truy vấn).
function withDerivedStatus(loan) {
  if (loan.status === 'BORROWED' && overdueDays(loan.dueDate) > 0) {
    return { ...loan, status: 'OVERDUE' };
  }
  return loan;
}

// FR-20: sinh viên gửi yêu cầu mượn. Áp dụng BR-01, BR-05, BR-06.
async function requestLoan(userId, bookId) {
  bookId = parseInt(bookId, 10);
  const cfg = await settingsService.getAll();

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new AppError(404, 'Không tìm thấy sách');
  if (book.availableCopies <= 0) throw new AppError(409, 'Sách hiện đã hết bản (BR-05)');

  // BR-06: đang có sách quá hạn thì không được mượn thêm
  const activeLoans = await prisma.loan.findMany({
    where: { userId, status: { in: ['PENDING', 'BORROWED', 'OVERDUE'] } },
  });
  const hasOverdue = activeLoans.some((l) => overdueDays(l.dueDate) > 0);
  if (hasOverdue) throw new AppError(409, 'Bạn đang có sách quá hạn, không thể mượn thêm (BR-06)');

  // BR-01: hạn mức số cuốn đang giữ (PENDING + BORROWED + OVERDUE)
  if (activeLoans.length >= cfg.max_books) {
    throw new AppError(409, `Vượt hạn mức mượn tối đa ${cfg.max_books} cuốn (BR-01)`);
  }

  // Tránh mượn trùng cùng một đầu sách đang chờ/đang mượn
  const dup = activeLoans.find((l) => l.bookId === bookId);
  if (dup) throw new AppError(409, 'Bạn đã có yêu cầu/đang mượn đầu sách này');

  const loan = await prisma.loan.create({
    data: { bookId, userId, status: 'PENDING' },
  });
  return serialize(loan);
}

// FR-26: lịch sử của sinh viên
async function myLoans(userId, status) {
  const where = { userId };
  if (status) where.status = status;
  const loans = await prisma.loan.findMany({
    where,
    include: { book: true },
    orderBy: { requestedAt: 'desc' },
  });
  return loans.map(withDerivedStatus).map(serialize);
}

// FR-21: thủ thư xem tất cả (lọc theo status)
async function listAll(status) {
  const loans = await prisma.loan.findMany({
    include: { book: true, user: true },
    orderBy: { requestedAt: 'desc' },
  });
  const derived = loans.map(withDerivedStatus);
  const filtered = status ? derived.filter((l) => l.status === status) : derived;
  return filtered.map(serialize);
}

// FR-28: danh sách quá hạn + phí phạt dự kiến
async function listOverdue() {
  const cfg = await settingsService.getAll();
  const loans = await prisma.loan.findMany({
    where: { status: 'BORROWED' },
    include: { book: true, user: true },
  });
  return loans
    .map((l) => ({ ...l, _overdue: overdueDays(l.dueDate) }))
    .filter((l) => l._overdue > 0)
    .map((l) => ({
      ...serialize(withDerivedStatus(l)),
      overdueDays: l._overdue,
      estimatedFine: l._overdue * cfg.fine_per_day,
    }));
}

// FR-22 + BR-08: duyệt mượn (transaction: giảm availableCopies, set dueDate)
async function approve(loanId) {
  loanId = parseInt(loanId, 10);
  const cfg = await settingsService.getAll();

  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new AppError(404, 'Không tìm thấy phiếu mượn');
    if (loan.status !== 'PENDING') throw new AppError(409, 'Chỉ duyệt được phiếu đang chờ');

    const book = await tx.book.findUnique({ where: { id: loan.bookId } });
    if (book.availableCopies <= 0) throw new AppError(409, 'Sách đã hết bản, không thể duyệt');

    await tx.book.update({
      where: { id: book.id },
      data: { availableCopies: { decrement: 1 } },
    });

    const now = new Date();
    const updated = await tx.loan.update({
      where: { id: loanId },
      data: {
        status: 'BORROWED',
        borrowedAt: now,
        dueDate: addDays(now, cfg.loan_days),
      },
      include: { book: true, user: true },
    });
    return serialize(updated);
  });
}

// FR-23: từ chối (không đổi availableCopies)
async function reject(loanId, reason) {
  loanId = parseInt(loanId, 10);
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new AppError(404, 'Không tìm thấy phiếu mượn');
  if (loan.status !== 'PENDING') throw new AppError(409, 'Chỉ từ chối được phiếu đang chờ');

  const updated = await prisma.loan.update({
    where: { id: loanId },
    data: { status: 'REJECTED', rejectReason: reason || 'Không có lý do' },
    include: { book: true, user: true },
  });
  return serialize(updated);
}

// FR-24 + BR-07/08: trả sách (transaction: tăng availableCopies, tính phí phạt)
async function returnBook(loanId) {
  loanId = parseInt(loanId, 10);
  const cfg = await settingsService.getAll();

  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new AppError(404, 'Không tìm thấy phiếu mượn');
    if (!['BORROWED', 'OVERDUE'].includes(loan.status)) {
      throw new AppError(409, 'Chỉ trả được phiếu đang mượn');
    }

    const now = new Date();
    const days = overdueDays(loan.dueDate, now);
    const fine = days * cfg.fine_per_day;

    await tx.book.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: 1 } },
    });

    const updated = await tx.loan.update({
      where: { id: loanId },
      data: { status: 'RETURNED', returnedAt: now, fineAmount: fine },
      include: { book: true, user: true },
    });
    return serialize(updated);
  });
}

// FR-25 + BR-03/04: gia hạn
async function renew(loanId, userId) {
  loanId = parseInt(loanId, 10);
  const cfg = await settingsService.getAll();

  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new AppError(404, 'Không tìm thấy phiếu mượn');
    if (loan.userId !== userId) throw new AppError(403, 'Không thể gia hạn phiếu của người khác');
    if (loan.status !== 'BORROWED') throw new AppError(409, 'Chỉ gia hạn được phiếu đang mượn');

    // BR-04: không gia hạn nếu đã quá hạn
    if (overdueDays(loan.dueDate) > 0) {
      throw new AppError(409, 'Sách đã quá hạn, không thể gia hạn (BR-04)');
    }
    // BR-03: tối đa max_renewals lần
    if (loan.renewalCount >= cfg.max_renewals) {
      throw new AppError(409, `Đã gia hạn tối đa ${cfg.max_renewals} lần (BR-03)`);
    }

    const oldDue = loan.dueDate;
    const newDue = addDays(new Date(oldDue), cfg.renew_days);

    await tx.loanRenewal.create({
      data: { loanId, oldDueDate: oldDue, newDueDate: newDue },
    });
    const updated = await tx.loan.update({
      where: { id: loanId },
      data: { dueDate: newDue, renewalCount: { increment: 1 } },
      include: { book: true, user: true },
    });
    return serialize(updated);
  });
}

module.exports = {
  requestLoan,
  myLoans,
  listAll,
  listOverdue,
  approve,
  reject,
  returnBook,
  renew,
};
