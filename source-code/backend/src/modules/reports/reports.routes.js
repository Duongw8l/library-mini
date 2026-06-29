const { Router } = require('express');
const prisma = require('../../config/prisma');
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const { authJwt, requireRole } = require('../../middlewares/auth');

const router = Router();

// FR-30: dashboard
router.get(
  '/dashboard',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  asyncHandler(async (_req, res) => {
    const [totalBooks, agg, borrowed, pending, totalUsers, allBorrowed] = await Promise.all([
      prisma.book.count(),
      prisma.book.aggregate({ _sum: { totalCopies: true } }),
      prisma.loan.count({ where: { status: 'BORROWED' } }),
      prisma.loan.count({ where: { status: 'PENDING' } }),
      prisma.user.count(),
      prisma.loan.findMany({ where: { status: 'BORROWED' }, select: { dueDate: true } }),
    ]);
    const now = Date.now();
    const overdue = allBorrowed.filter((l) => l.dueDate && new Date(l.dueDate).getTime() < now).length;

    return ok(res, {
      totalBooks,
      totalCopies: agg._sum.totalCopies || 0,
      borrowed,
      overdue,
      pending,
      totalUsers,
    });
  })
);

// FR-31: top sách mượn nhiều
router.get(
  '/top-books',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const limit = Math.min(50, parseInt(req.query.limit || '5', 10));
    const grouped = await prisma.loan.groupBy({
      by: ['bookId'],
      where: { status: { in: ['BORROWED', 'OVERDUE', 'RETURNED'] } },
      _count: { bookId: true },
      orderBy: { _count: { bookId: 'desc' } },
      take: limit,
    });
    const books = await prisma.book.findMany({
      where: { id: { in: grouped.map((g) => g.bookId) } },
    });
    const map = Object.fromEntries(books.map((b) => [b.id, b]));
    const data = grouped.map((g) => ({
      bookId: g.bookId,
      title: map[g.bookId]?.title || '(đã xóa)',
      borrowCount: g._count.bookId,
    }));
    return ok(res, data);
  })
);

// FR-32: lượt mượn theo khoảng thời gian
router.get(
  '/loans-by-period',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const where = {};
    if (from || to) {
      where.requestedAt = {};
      if (from) where.requestedAt.gte = new Date(from);
      if (to) where.requestedAt.lte = new Date(to);
    }
    const loans = await prisma.loan.findMany({ where, select: { requestedAt: true } });
    const counts = {};
    for (const l of loans) {
      const key = l.requestedAt.toISOString().slice(0, 10); // theo ngày
      counts[key] = (counts[key] || 0) + 1;
    }
    const data = Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return ok(res, data);
  })
);

// Lượt mượn & trả theo 7 ngày gần nhất (cho biểu đồ cột chồng ở Dashboard).
router.get(
  '/borrow-return-7days',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  asyncHandler(async (_req, res) => {
    const DAY = 24 * 60 * 60 * 1000;
    const LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today.getTime() - 6 * DAY);

    const loans = await prisma.loan.findMany({
      where: {
        OR: [{ borrowedAt: { gte: start } }, { returnedAt: { gte: start } }],
      },
      select: { borrowedAt: true, returnedAt: true },
    });

    // Khởi tạo 7 ngày
    const buckets = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(start.getTime() + i * DAY);
      buckets.push({
        date: d.toISOString().slice(0, 10),
        label: LABELS[d.getDay()],
        borrowed: 0,
        returned: 0,
      });
    }
    const idx = (dt) => Math.floor((new Date(dt).setHours(0, 0, 0, 0) - start.getTime()) / DAY);
    for (const l of loans) {
      if (l.borrowedAt) {
        const i = idx(l.borrowedAt);
        if (i >= 0 && i < 7) buckets[i].borrowed += 1;
      }
      if (l.returnedAt) {
        const i = idx(l.returnedAt);
        if (i >= 0 && i < 7) buckets[i].returned += 1;
      }
    }
    return ok(res, buckets);
  })
);

// Phân bố phiếu mượn theo trạng thái (cho biểu đồ tròn).
// OVERDUE được suy ra từ phiếu BORROWED đã quá hạn.
router.get(
  '/loans-by-status',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  asyncHandler(async (_req, res) => {
    const loans = await prisma.loan.findMany({ select: { status: true, dueDate: true } });
    const now = Date.now();
    const counts = { PENDING: 0, BORROWED: 0, OVERDUE: 0, RETURNED: 0, REJECTED: 0 };
    for (const l of loans) {
      let s = l.status;
      if (s === 'BORROWED' && l.dueDate && new Date(l.dueDate).getTime() < now) s = 'OVERDUE';
      counts[s] = (counts[s] || 0) + 1;
    }
    const data = Object.entries(counts).map(([status, count]) => ({ status, count }));
    return ok(res, data);
  })
);

// Số đầu sách theo thể loại (cho biểu đồ cột).
router.get(
  '/books-by-category',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: 'asc' },
    });
    const data = categories.map((c) => ({ category: c.name, count: c._count.books }));
    return ok(res, data);
  })
);

// FR-33: xuất CSV (ADMIN)
router.get(
  '/export',
  authJwt,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const type = req.query.type || 'loans';
    let rows = [];
    let header = '';

    if (type === 'books') {
      const books = await prisma.book.findMany({ include: { category: true, author: true } });
      header = 'id,title,isbn,category,author,totalCopies,availableCopies';
      rows = books.map((b) =>
        [b.id, csv(b.title), csv(b.isbn), csv(b.category?.name), csv(b.author?.name), b.totalCopies, b.availableCopies].join(',')
      );
    } else {
      const loans = await prisma.loan.findMany({ include: { book: true, user: true } });
      header = 'id,book,user,status,borrowedAt,dueDate,returnedAt,fineAmount';
      rows = loans.map((l) =>
        [l.id, csv(l.book?.title), csv(l.user?.fullName), l.status, iso(l.borrowedAt), iso(l.dueDate), iso(l.returnedAt), l.fineAmount].join(',')
      );
    }

    const content = '﻿' + [header, ...rows].join('\n'); // BOM cho Excel đọc UTF-8
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="report-${type}.csv"`);
    return res.status(200).send(content);
  })
);

function csv(v) {
  if (v == null) return '';
  const s = String(v).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}
function iso(d) {
  return d ? new Date(d).toISOString() : '';
}

module.exports = router;
