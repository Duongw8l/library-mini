const { Router } = require('express'); // Hàm tạo router con
const prisma = require('../../config/prisma'); // Client truy vấn DB
const asyncHandler = require('../../utils/asyncHandler'); // Hàm bọc tự bắt lỗi async
const { ok } = require('../../utils/response'); // Helper trả response 200
const { authJwt, requireRole } = require('../../middlewares/auth'); // Middleware đăng nhập và phân quyền

const router = Router(); // Tạo router cho nhóm /reports

// FR-30: dashboard
router.get( // GET /reports/dashboard: số liệu tổng quan
  '/dashboard', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  asyncHandler(async (_req, res) => { // Handler
    const [totalBooks, agg, borrowed, pending, totalUsers, allBorrowed] = await Promise.all([ // Chạy nhiều truy vấn song song cho nhanh
      prisma.book.count(), // Tổng số đầu sách
      prisma.book.aggregate({ _sum: { totalCopies: true } }), // Tổng số bản (cộng totalCopies)
      prisma.loan.count({ where: { status: 'BORROWED' } }), // Số phiếu đang mượn
      prisma.loan.count({ where: { status: 'PENDING' } }), // Số phiếu đang chờ duyệt
      prisma.user.count(), // Tổng số người dùng
      prisma.loan.findMany({ where: { status: 'BORROWED' }, select: { dueDate: true } }), // Lấy hạn trả của các phiếu đang mượn (để tính quá hạn)
    ]); // Kết thúc Promise.all
    const now = Date.now(); // Mốc thời gian hiện tại (ms)
    const overdue = allBorrowed.filter((l) => l.dueDate && new Date(l.dueDate).getTime() < now).length; // Đếm phiếu đã quá hạn (hạn trả < hiện tại)

    return ok(res, { // Trả các số liệu cho dashboard
      totalBooks, // Tổng đầu sách
      totalCopies: agg._sum.totalCopies || 0, // Tổng số bản (0 nếu chưa có)
      borrowed, // Số đang mượn
      overdue, // Số quá hạn
      pending, // Số chờ duyệt
      totalUsers, // Tổng người dùng
    }); // Kết thúc trả
  }) // Kết thúc handler
); // Kết thúc route dashboard

// FR-31: top sách mượn nhiều
router.get( // GET /reports/top-books: sách được mượn nhiều nhất
  '/top-books', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  asyncHandler(async (req, res) => { // Handler
    const limit = Math.min(50, parseInt(req.query.limit || '5', 10)); // Số lượng top muốn lấy (mặc định 5, tối đa 50)
    const grouped = await prisma.loan.groupBy({ // Gom nhóm phiếu theo sách để đếm lượt mượn
      by: ['bookId'], // Nhóm theo mã sách
      where: { status: { in: ['BORROWED', 'OVERDUE', 'RETURNED'] } }, // Chỉ tính các phiếu đã thực sự mượn
      _count: { bookId: true }, // Đếm số phiếu mỗi sách
      orderBy: { _count: { bookId: 'desc' } }, // Sắp theo số lượt mượn giảm dần
      take: limit, // Lấy top theo limit
    }); // Kết thúc groupBy
    const books = await prisma.book.findMany({ // Lấy thông tin các sách trong top
      where: { id: { in: grouped.map((g) => g.bookId) } }, // Theo danh sách bookId vừa gom
    }); // Kết thúc findMany
    const map = Object.fromEntries(books.map((b) => [b.id, b])); // Tạo map id -> sách để tra cứu nhanh
    const data = grouped.map((g) => ({ // Ghép số lượt mượn với tên sách
      bookId: g.bookId, // Mã sách
      title: map[g.bookId]?.title || '(đã xóa)', // Tên sách (hoặc '(đã xóa)' nếu sách không còn)
      borrowCount: g._count.bookId, // Số lượt mượn
    })); // Kết thúc map
    return ok(res, data); // Trả danh sách top
  }) // Kết thúc handler
); // Kết thúc route top-books

// FR-32: lượt mượn theo khoảng thời gian
router.get( // GET /reports/loans-by-period: số lượt mượn theo ngày trong khoảng
  '/loans-by-period', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  asyncHandler(async (req, res) => { // Handler
    const { from, to } = req.query; // Lấy mốc bắt đầu/kết thúc từ URL
    const where = {}; // Điều kiện lọc theo thời gian
    if (from || to) { // Nếu có chỉ định khoảng thời gian
      where.requestedAt = {}; // Lọc theo thời điểm gửi yêu cầu
      if (from) where.requestedAt.gte = new Date(from); // >= mốc bắt đầu
      if (to) where.requestedAt.lte = new Date(to); // <= mốc kết thúc
    } // Kết thúc nhánh thời gian
    const loans = await prisma.loan.findMany({ where, select: { requestedAt: true } }); // Lấy ngày gửi yêu cầu của các phiếu khớp
    const counts = {}; // Bộ đếm số lượt theo từng ngày
    for (const l of loans) { // Duyệt từng phiếu
      const key = l.requestedAt.toISOString().slice(0, 10); // theo ngày
      counts[key] = (counts[key] || 0) + 1; // Tăng đếm cho ngày tương ứng
    } // Kết thúc vòng lặp
    const data = Object.entries(counts) // Chuyển object đếm thành mảng
      .map(([date, count]) => ({ date, count })) // Mỗi phần tử gồm ngày và số lượt
      .sort((a, b) => a.date.localeCompare(b.date)); // Sắp xếp theo ngày tăng dần
    return ok(res, data); // Trả dữ liệu biểu đồ
  }) // Kết thúc handler
); // Kết thúc route loans-by-period

// Lượt mượn & trả theo 7 ngày gần nhất (cho biểu đồ cột chồng ở Dashboard).
router.get( // GET /reports/borrow-return-7days
  '/borrow-return-7days', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  asyncHandler(async (_req, res) => { // Handler
    const DAY = 24 * 60 * 60 * 1000; // Số ms trong 1 ngày
    const LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Nhãn thứ trong tuần (getDay trả 0=CN)
    const today = new Date(); // Hôm nay
    today.setHours(0, 0, 0, 0); // Đưa về đầu ngày (00:00)
    const start = new Date(today.getTime() - 6 * DAY); // Mốc bắt đầu = 6 ngày trước (tổng 7 ngày)

    const loans = await prisma.loan.findMany({ // Lấy phiếu có phát sinh mượn hoặc trả trong 7 ngày
      where: { // Điều kiện
        OR: [{ borrowedAt: { gte: start } }, { returnedAt: { gte: start } }], // Mượn hoặc trả từ mốc start trở đi
      }, // Kết thúc where
      select: { borrowedAt: true, returnedAt: true }, // Chỉ lấy 2 mốc thời gian cần dùng
    }); // Kết thúc findMany

    // Khởi tạo 7 ngày
    const buckets = []; // Mảng 7 "ô" tương ứng 7 ngày
    for (let i = 0; i < 7; i += 1) { // Lặp tạo từng ngày
      const d = new Date(start.getTime() + i * DAY); // Ngày thứ i tính từ start
      buckets.push({ // Thêm một ô
        date: d.toISOString().slice(0, 10), // Ngày dạng YYYY-MM-DD
        label: LABELS[d.getDay()], // Nhãn thứ
        borrowed: 0, // Số lượt mượn (khởi tạo 0)
        returned: 0, // Số lượt trả (khởi tạo 0)
      }); // Kết thúc push
    } // Kết thúc vòng tạo ngày
    const idx = (dt) => Math.floor((new Date(dt).setHours(0, 0, 0, 0) - start.getTime()) / DAY); // Hàm tính chỉ số ô (0..6) cho một mốc thời gian
    for (const l of loans) { // Duyệt từng phiếu
      if (l.borrowedAt) { // Nếu có ngày mượn
        const i = idx(l.borrowedAt); // Tính ô tương ứng
        if (i >= 0 && i < 7) buckets[i].borrowed += 1; // Trong phạm vi 7 ngày thì tăng đếm mượn
      } // Kết thúc nhánh mượn
      if (l.returnedAt) { // Nếu có ngày trả
        const i = idx(l.returnedAt); // Tính ô tương ứng
        if (i >= 0 && i < 7) buckets[i].returned += 1; // Trong phạm vi thì tăng đếm trả
      } // Kết thúc nhánh trả
    } // Kết thúc vòng lặp phiếu
    return ok(res, buckets); // Trả dữ liệu 7 ngày
  }) // Kết thúc handler
); // Kết thúc route borrow-return-7days

// Phân bố phiếu mượn theo trạng thái (cho biểu đồ tròn).
// OVERDUE được suy ra từ phiếu BORROWED đã quá hạn.
router.get( // GET /reports/loans-by-status
  '/loans-by-status', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  asyncHandler(async (_req, res) => { // Handler
    const loans = await prisma.loan.findMany({ select: { status: true, dueDate: true } }); // Lấy trạng thái và hạn trả của tất cả phiếu
    const now = Date.now(); // Thời điểm hiện tại
    const counts = { PENDING: 0, BORROWED: 0, OVERDUE: 0, RETURNED: 0, REJECTED: 0 }; // Bộ đếm cho từng trạng thái
    for (const l of loans) { // Duyệt từng phiếu
      let s = l.status; // Trạng thái gốc
      if (s === 'BORROWED' && l.dueDate && new Date(l.dueDate).getTime() < now) s = 'OVERDUE'; // Đang mượn mà quá hạn -> tính là OVERDUE
      counts[s] = (counts[s] || 0) + 1; // Tăng đếm cho trạng thái tương ứng
    } // Kết thúc vòng lặp
    const data = Object.entries(counts).map(([status, count]) => ({ status, count })); // Chuyển thành mảng { status, count }
    return ok(res, data); // Trả dữ liệu biểu đồ tròn
  }) // Kết thúc handler
); // Kết thúc route loans-by-status

// Số đầu sách theo thể loại (cho biểu đồ cột).
router.get( // GET /reports/books-by-category
  '/books-by-category', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  asyncHandler(async (_req, res) => { // Handler
    const categories = await prisma.category.findMany({ // Lấy các thể loại
      include: { _count: { select: { books: true } } }, // Kèm số lượng sách của mỗi thể loại
      orderBy: { name: 'asc' }, // Sắp theo tên
    }); // Kết thúc findMany
    const data = categories.map((c) => ({ category: c.name, count: c._count.books })); // Chuyển thành { tên thể loại, số sách }
    return ok(res, data); // Trả dữ liệu biểu đồ
  }) // Kết thúc handler
); // Kết thúc route books-by-category

// FR-33: xuất CSV (ADMIN)
router.get( // GET /reports/export: tải báo cáo CSV
  '/export', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('ADMIN'), // Chỉ admin
  asyncHandler(async (req, res) => { // Handler
    const type = req.query.type || 'loans'; // Loại báo cáo: 'books' hoặc 'loans' (mặc định loans)
    let rows = []; // Các dòng dữ liệu CSV
    let header = ''; // Dòng tiêu đề cột

    if (type === 'books') { // Nếu xuất danh sách sách
      const books = await prisma.book.findMany({ include: { category: true, author: true } }); // Lấy sách kèm thể loại, tác giả
      header = 'id,title,isbn,category,author,totalCopies,availableCopies'; // Tiêu đề cột cho sách
      rows = books.map((b) => // Mỗi sách thành 1 dòng CSV
        [b.id, csv(b.title), csv(b.isbn), csv(b.category?.name), csv(b.author?.name), b.totalCopies, b.availableCopies].join(',') // Ghép các cột bằng dấu phẩy (escape an toàn)
      ); // Kết thúc map
    } else { // Ngược lại xuất danh sách phiếu mượn
      const loans = await prisma.loan.findMany({ include: { book: true, user: true } }); // Lấy phiếu kèm sách, người mượn
      header = 'id,book,user,status,borrowedAt,dueDate,returnedAt,fineAmount'; // Tiêu đề cột cho phiếu mượn
      rows = loans.map((l) => // Mỗi phiếu thành 1 dòng
        [l.id, csv(l.book?.title), csv(l.user?.fullName), l.status, iso(l.borrowedAt), iso(l.dueDate), iso(l.returnedAt), l.fineAmount].join(',') // Ghép các cột
      ); // Kết thúc map
    } // Kết thúc phân loại

    const content = '﻿' + [header, ...rows].join('\n'); // BOM cho Excel đọc UTF-8
    res.setHeader('Content-Type', 'text/csv; charset=utf-8'); // Báo cho trình duyệt đây là file CSV UTF-8
    res.setHeader('Content-Disposition', `attachment; filename="report-${type}.csv"`); // Buộc tải xuống với tên file tương ứng
    return res.status(200).send(content); // Gửi nội dung CSV
  }) // Kết thúc handler
); // Kết thúc route export

function csv(v) { // Hàm escape giá trị để an toàn trong CSV
  if (v == null) return ''; // null/undefined -> chuỗi rỗng
  const s = String(v).replace(/"/g, '""'); // Nhân đôi dấu nháy kép theo chuẩn CSV
  return /[",\n]/.test(s) ? `"${s}"` : s; // Nếu có dấu phẩy/nháy/xuống dòng thì bọc trong nháy kép
} // Kết thúc csv
function iso(d) { // Hàm định dạng ngày sang chuỗi ISO
  return d ? new Date(d).toISOString() : ''; // Có ngày thì trả ISO, không thì rỗng
} // Kết thúc iso

module.exports = router; // Xuất router để gắn vào /api/reports
