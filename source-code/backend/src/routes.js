const { Router } = require('express'); // Lấy hàm Router của Express để tạo bộ định tuyến con

const router = Router(); // Tạo một router tổng để gom các nhóm route theo module

router.use('/auth', require('./modules/auth/auth.routes')); // Gắn nhóm route xác thực (đăng nhập/đăng ký) tại /api/auth
router.use('/books', require('./modules/books/books.routes')); // Gắn nhóm route quản lý sách tại /api/books
router.use('/categories', require('./modules/categories/categories.routes')); // Gắn nhóm route thể loại sách tại /api/categories
router.use('/authors', require('./modules/authors/authors.routes')); // Gắn nhóm route tác giả tại /api/authors
router.use('/loans', require('./modules/loans/loans.routes')); // Gắn nhóm route mượn/trả sách tại /api/loans
router.use('/reports', require('./modules/reports/reports.routes')); // Gắn nhóm route báo cáo/thống kê tại /api/reports
router.use('/users', require('./modules/users/users.routes')); // Gắn nhóm route quản lý người dùng tại /api/users
router.use('/settings', require('./modules/settings/settings.routes')); // Gắn nhóm route cấu hình hệ thống tại /api/settings

module.exports = router; // Xuất router tổng để app.js gắn vào tiền tố /api
