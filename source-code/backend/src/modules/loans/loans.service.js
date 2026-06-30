const prisma = require('../../config/prisma'); // Client truy vấn DB
const AppError = require('../../utils/AppError'); // Lớp lỗi tùy biến
const settingsService = require('../settings/settings.service'); // Service đọc các tham số cấu hình (hạn mức, số ngày mượn...)
const { addDays, overdueDays } = require('./loan.rules'); // Hai hàm thuần: cộng ngày và tính số ngày quá hạn

function serialize(loan) { // Chuyển bản ghi phiếu mượn thành dạng gọn để trả ra API
  return { // Object kết quả
    id: loan.id, // Mã phiếu
    status: loan.status, // Trạng thái (PENDING/BORROWED/OVERDUE/RETURNED/REJECTED)
    bookId: loan.bookId, // Mã sách
    userId: loan.userId, // Mã người mượn
    book: loan.book ? { id: loan.book.id, title: loan.book.title, isbn: loan.book.isbn } : undefined, // Thông tin sách (nếu có nạp kèm)
    user: loan.user ? { id: loan.user.id, fullName: loan.user.fullName } : undefined, // Thông tin người mượn (nếu có nạp kèm)
    requestedAt: loan.requestedAt, // Thời điểm gửi yêu cầu mượn
    borrowedAt: loan.borrowedAt, // Thời điểm được duyệt/bắt đầu mượn
    dueDate: loan.dueDate, // Hạn phải trả
    returnedAt: loan.returnedAt, // Thời điểm đã trả
    renewalCount: loan.renewalCount, // Số lần đã gia hạn
    fineAmount: loan.fineAmount, // Tiền phạt (nếu trả trễ)
    rejectReason: loan.rejectReason, // Lý do bị từ chối (nếu có)
  }; // Kết thúc object
} // Kết thúc serialize

// FR-27: nếu phiếu BORROWED đã quá hạn thì coi như OVERDUE (đánh dấu khi truy vấn).
function withDerivedStatus(loan) { // Suy ra trạng thái OVERDUE khi đọc dữ liệu (DB vẫn lưu BORROWED)
  if (loan.status === 'BORROWED' && overdueDays(loan.dueDate) > 0) { // Nếu đang mượn mà đã quá hạn
    return { ...loan, status: 'OVERDUE' }; // Trả bản sao với trạng thái OVERDUE
  } // Kết thúc kiểm tra
  return loan; // Ngược lại giữ nguyên
} // Kết thúc withDerivedStatus

// FR-20: sinh viên gửi yêu cầu mượn. Áp dụng BR-01, BR-05, BR-06.
async function requestLoan(userId, bookId) { // Tạo yêu cầu mượn cho user với sách bookId
  bookId = parseInt(bookId, 10); // Ép bookId sang số nguyên
  const cfg = await settingsService.getAll(); // Lấy cấu hình nghiệp vụ hiện tại

  const book = await prisma.book.findUnique({ where: { id: bookId } }); // Tìm sách
  if (!book) throw new AppError(404, 'Không tìm thấy sách'); // Không có -> 404
  if (book.availableCopies <= 0) throw new AppError(409, 'Sách hiện đã hết bản (BR-05)'); // Hết bản -> không cho mượn

  // BR-06: đang có sách quá hạn thì không được mượn thêm
  const activeLoans = await prisma.loan.findMany({ // Lấy các phiếu đang hoạt động của user
    where: { userId, status: { in: ['PENDING', 'BORROWED', 'OVERDUE'] } }, // Trạng thái đang chờ/đang mượn/quá hạn
  }); // Kết thúc truy vấn
  const hasOverdue = activeLoans.some((l) => overdueDays(l.dueDate) > 0); // Kiểm tra có phiếu nào đang quá hạn không
  if (hasOverdue) throw new AppError(409, 'Bạn đang có sách quá hạn, không thể mượn thêm (BR-06)'); // Có quá hạn -> chặn

  // BR-01: hạn mức số cuốn đang giữ (PENDING + BORROWED + OVERDUE)
  if (activeLoans.length >= cfg.max_books) { // Nếu số phiếu đang giữ đã đạt hạn mức
    throw new AppError(409, `Vượt hạn mức mượn tối đa ${cfg.max_books} cuốn (BR-01)`); // -> chặn
  } // Kết thúc kiểm tra hạn mức

  // Tránh mượn trùng cùng một đầu sách đang chờ/đang mượn
  const dup = activeLoans.find((l) => l.bookId === bookId); // Tìm xem đã có phiếu cho đúng đầu sách này chưa
  if (dup) throw new AppError(409, 'Bạn đã có yêu cầu/đang mượn đầu sách này'); // Có rồi -> chặn

  const loan = await prisma.loan.create({ // Tạo phiếu mượn mới
    data: { bookId, userId, status: 'PENDING' }, // Trạng thái ban đầu là chờ duyệt
  }); // Kết thúc create
  return serialize(loan); // Trả phiếu vừa tạo
} // Kết thúc requestLoan

// FR-26: lịch sử của sinh viên
async function myLoans(userId, status) { // Lấy danh sách phiếu của một sinh viên
  const where = { userId }; // Điều kiện: theo người dùng
  if (status) where.status = status; // Nếu có lọc trạng thái thì thêm điều kiện
  const loans = await prisma.loan.findMany({ // Truy vấn phiếu
    where, // Điều kiện lọc
    include: { book: true }, // Lấy kèm thông tin sách
    orderBy: { requestedAt: 'desc' }, // Sắp xếp mới nhất trước
  }); // Kết thúc truy vấn
  return loans.map(withDerivedStatus).map(serialize); // Suy ra trạng thái quá hạn rồi rút gọn từng phiếu
} // Kết thúc myLoans

// FR-21: thủ thư xem tất cả (lọc theo status)
async function listAll(status) { // Lấy tất cả phiếu cho thủ thư
  const loans = await prisma.loan.findMany({ // Truy vấn toàn bộ phiếu
    include: { book: true, user: true }, // Lấy kèm sách và người mượn
    orderBy: { requestedAt: 'desc' }, // Mới nhất trước
  }); // Kết thúc truy vấn
  const derived = loans.map(withDerivedStatus); // Suy ra trạng thái OVERDUE nếu cần
  const filtered = status ? derived.filter((l) => l.status === status) : derived; // Lọc theo trạng thái (sau khi đã suy ra) nếu có
  return filtered.map(serialize); // Rút gọn từng phiếu
} // Kết thúc listAll

// FR-28: danh sách quá hạn + phí phạt dự kiến
async function listOverdue() { // Lấy danh sách phiếu quá hạn kèm tiền phạt ước tính
  const cfg = await settingsService.getAll(); // Lấy cấu hình (phí phạt/ngày)
  const loans = await prisma.loan.findMany({ // Lấy các phiếu đang mượn
    where: { status: 'BORROWED' }, // Chỉ xét phiếu trạng thái BORROWED trong DB
    include: { book: true, user: true }, // Kèm sách và người mượn
  }); // Kết thúc truy vấn
  return loans
    .map((l) => ({ ...l, _overdue: overdueDays(l.dueDate) })) // Tính số ngày quá hạn cho mỗi phiếu
    .filter((l) => l._overdue > 0) // Chỉ giữ phiếu thực sự quá hạn
    .map((l) => ({ // Tạo kết quả trả ra
      ...serialize(withDerivedStatus(l)), // Phiếu đã rút gọn (trạng thái suy ra thành OVERDUE)
      overdueDays: l._overdue, // Số ngày quá hạn
      estimatedFine: l._overdue * cfg.fine_per_day, // Tiền phạt dự kiến = số ngày trễ × phí/ngày
    })); // Kết thúc map
} // Kết thúc listOverdue

// FR-22 + BR-08: duyệt mượn (transaction: giảm availableCopies, set dueDate)
async function approve(loanId) { // Thủ thư duyệt một phiếu mượn
  loanId = parseInt(loanId, 10); // Ép id sang số
  const cfg = await settingsService.getAll(); // Lấy cấu hình (số ngày cho mượn)

  return prisma.$transaction(async (tx) => { // Dùng transaction để cập nhật phiếu và sách "cùng thành công hoặc cùng thất bại"
    const loan = await tx.loan.findUnique({ where: { id: loanId } }); // Lấy phiếu
    if (!loan) throw new AppError(404, 'Không tìm thấy phiếu mượn'); // Không có -> 404
    if (loan.status !== 'PENDING') throw new AppError(409, 'Chỉ duyệt được phiếu đang chờ'); // Chỉ duyệt phiếu đang chờ

    const book = await tx.book.findUnique({ where: { id: loan.bookId } }); // Lấy sách của phiếu
    if (book.availableCopies <= 0) throw new AppError(409, 'Sách đã hết bản, không thể duyệt'); // Hết bản -> không duyệt

    await tx.book.update({ // Cập nhật sách
      where: { id: book.id }, // Theo id sách
      data: { availableCopies: { decrement: 1 } }, // Giảm số bản còn lại đi 1
    }); // Kết thúc update sách

    const now = new Date(); // Mốc thời gian duyệt
    const updated = await tx.loan.update({ // Cập nhật phiếu
      where: { id: loanId }, // Theo id phiếu
      data: { // Dữ liệu mới
        status: 'BORROWED', // Chuyển sang đang mượn
        borrowedAt: now, // Ghi thời điểm bắt đầu mượn
        dueDate: addDays(now, cfg.loan_days), // Tính hạn trả = hôm nay + số ngày cho mượn
      }, // Kết thúc data
      include: { book: true, user: true }, // Kèm sách, người mượn để trả về
    }); // Kết thúc update phiếu
    return serialize(updated); // Trả phiếu sau khi duyệt
  }); // Kết thúc transaction
} // Kết thúc approve

// FR-23: từ chối (không đổi availableCopies)
async function reject(loanId, reason) { // Thủ thư từ chối một phiếu
  loanId = parseInt(loanId, 10); // Ép id sang số
  const loan = await prisma.loan.findUnique({ where: { id: loanId } }); // Lấy phiếu
  if (!loan) throw new AppError(404, 'Không tìm thấy phiếu mượn'); // Không có -> 404
  if (loan.status !== 'PENDING') throw new AppError(409, 'Chỉ từ chối được phiếu đang chờ'); // Chỉ từ chối phiếu đang chờ

  const updated = await prisma.loan.update({ // Cập nhật phiếu
    where: { id: loanId }, // Theo id
    data: { status: 'REJECTED', rejectReason: reason || 'Không có lý do' }, // Chuyển sang bị từ chối, lưu lý do
    include: { book: true, user: true }, // Kèm sách, người mượn
  }); // Kết thúc update
  return serialize(updated); // Trả phiếu sau khi từ chối
} // Kết thúc reject

// FR-24 + BR-07/08: trả sách (transaction: tăng availableCopies, tính phí phạt)
async function returnBook(loanId) { // Thủ thư xác nhận trả sách
  loanId = parseInt(loanId, 10); // Ép id sang số
  const cfg = await settingsService.getAll(); // Lấy cấu hình (phí phạt/ngày)

  return prisma.$transaction(async (tx) => { // Transaction để cập nhật phiếu và sách an toàn
    const loan = await tx.loan.findUnique({ where: { id: loanId } }); // Lấy phiếu
    if (!loan) throw new AppError(404, 'Không tìm thấy phiếu mượn'); // Không có -> 404
    if (!['BORROWED', 'OVERDUE'].includes(loan.status)) { // Chỉ trả được phiếu đang mượn/quá hạn
      throw new AppError(409, 'Chỉ trả được phiếu đang mượn'); // Ngược lại -> lỗi
    } // Kết thúc kiểm tra trạng thái

    const now = new Date(); // Mốc thời gian trả
    const days = overdueDays(loan.dueDate, now); // Số ngày trễ so với hạn
    const fine = days * cfg.fine_per_day; // Tiền phạt = số ngày trễ × phí/ngày

    await tx.book.update({ // Cập nhật sách
      where: { id: loan.bookId }, // Theo id sách
      data: { availableCopies: { increment: 1 } }, // Trả lại 1 bản vào kho
    }); // Kết thúc update sách

    const updated = await tx.loan.update({ // Cập nhật phiếu
      where: { id: loanId }, // Theo id
      data: { status: 'RETURNED', returnedAt: now, fineAmount: fine }, // Đánh dấu đã trả, ghi thời điểm và tiền phạt
      include: { book: true, user: true }, // Kèm sách, người mượn
    }); // Kết thúc update phiếu
    return serialize(updated); // Trả phiếu sau khi trả sách
  }); // Kết thúc transaction
} // Kết thúc returnBook

// FR-25 + BR-03/04: gia hạn
async function renew(loanId, userId) { // Sinh viên gia hạn một phiếu của mình
  loanId = parseInt(loanId, 10); // Ép id sang số
  const cfg = await settingsService.getAll(); // Lấy cấu hình (số ngày gia hạn, số lần tối đa)

  return prisma.$transaction(async (tx) => { // Transaction để ghi lịch sử gia hạn và cập nhật phiếu cùng lúc
    const loan = await tx.loan.findUnique({ where: { id: loanId } }); // Lấy phiếu
    if (!loan) throw new AppError(404, 'Không tìm thấy phiếu mượn'); // Không có -> 404
    if (loan.userId !== userId) throw new AppError(403, 'Không thể gia hạn phiếu của người khác'); // Không phải chủ phiếu -> 403
    if (loan.status !== 'BORROWED') throw new AppError(409, 'Chỉ gia hạn được phiếu đang mượn'); // Chỉ gia hạn phiếu đang mượn

    // BR-04: không gia hạn nếu đã quá hạn
    if (overdueDays(loan.dueDate) > 0) { // Nếu đã quá hạn
      throw new AppError(409, 'Sách đã quá hạn, không thể gia hạn (BR-04)'); // -> chặn
    } // Kết thúc kiểm tra quá hạn
    // BR-03: tối đa max_renewals lần
    if (loan.renewalCount >= cfg.max_renewals) { // Nếu đã gia hạn đủ số lần tối đa
      throw new AppError(409, `Đã gia hạn tối đa ${cfg.max_renewals} lần (BR-03)`); // -> chặn
    } // Kết thúc kiểm tra số lần

    const oldDue = loan.dueDate; // Lưu hạn trả cũ
    const newDue = addDays(new Date(oldDue), cfg.renew_days); // Hạn mới = hạn cũ + số ngày gia hạn

    await tx.loanRenewal.create({ // Ghi một dòng lịch sử gia hạn
      data: { loanId, oldDueDate: oldDue, newDueDate: newDue }, // Lưu hạn cũ và hạn mới
    }); // Kết thúc tạo lịch sử
    const updated = await tx.loan.update({ // Cập nhật phiếu
      where: { id: loanId }, // Theo id
      data: { dueDate: newDue, renewalCount: { increment: 1 } }, // Đổi hạn trả và tăng số lần gia hạn lên 1
      include: { book: true, user: true }, // Kèm sách, người mượn
    }); // Kết thúc update
    return serialize(updated); // Trả phiếu sau khi gia hạn
  }); // Kết thúc transaction
} // Kết thúc renew

module.exports = { // Xuất các hàm nghiệp vụ cho controller
  requestLoan, // Gửi yêu cầu mượn
  myLoans, // Lịch sử của sinh viên
  listAll, // Tất cả phiếu (thủ thư)
  listOverdue, // Danh sách quá hạn
  approve, // Duyệt phiếu
  reject, // Từ chối phiếu
  returnBook, // Trả sách
  renew, // Gia hạn
}; // Kết thúc export
