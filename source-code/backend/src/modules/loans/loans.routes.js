const { Router } = require('express'); // Hàm tạo router con
const { body, param } = require('express-validator'); // Rule kiểm tra body và tham số đường dẫn
const controller = require('./loans.controller'); // Các handler của module loans
const validate = require('../../middlewares/validate'); // Middleware gom lỗi validate
const { authJwt, requireRole } = require('../../middlewares/auth'); // Middleware đăng nhập và phân quyền

const router = Router(); // Tạo router cho nhóm /loans

// Sinh viên
router.post( // POST /loans: gửi yêu cầu mượn
  '/', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('STUDENT'), // Chỉ sinh viên được gửi yêu cầu mượn
  body('bookId').isInt().withMessage('bookId không hợp lệ'), // bookId phải là số nguyên
  validate, // Kiểm tra lỗi
  controller.request // Gọi handler tạo yêu cầu
); // Kết thúc route POST
router.get('/my', authJwt, requireRole('STUDENT'), controller.my); // GET /loans/my: sinh viên xem phiếu của mình
router.patch('/:id/renew', authJwt, requireRole('STUDENT'), param('id').isInt(), validate, controller.renew); // PATCH /loans/:id/renew: sinh viên gia hạn phiếu

// Thủ thư / Admin
router.get('/', authJwt, requireRole('LIBRARIAN', 'ADMIN'), controller.list); // GET /loans: thủ thư/admin xem tất cả phiếu
router.get('/overdue', authJwt, requireRole('LIBRARIAN', 'ADMIN'), controller.overdue); // GET /loans/overdue: xem phiếu quá hạn
router.patch('/:id/approve', authJwt, requireRole('LIBRARIAN', 'ADMIN'), param('id').isInt(), validate, controller.approve); // PATCH duyệt phiếu
router.patch( // PATCH /loans/:id/reject: từ chối phiếu
  '/:id/reject', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  [param('id').isInt(), body('reason').optional().isString()], // id là số nguyên; reason (lý do) là chuỗi tùy chọn
  validate, // Kiểm tra lỗi
  controller.reject // Gọi handler từ chối
); // Kết thúc route reject
router.patch('/:id/return', authJwt, requireRole('LIBRARIAN', 'ADMIN'), param('id').isInt(), validate, controller.returnBook); // PATCH xác nhận trả sách

module.exports = router; // Xuất router để gắn vào /api/loans
