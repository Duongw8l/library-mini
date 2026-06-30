const { Router } = require('express'); // Hàm tạo router con
const { body, param } = require('express-validator'); // Rule kiểm tra dữ liệu trong body và trong tham số đường dẫn
const controller = require('./books.controller'); // Các handler của module books
const validate = require('../../middlewares/validate'); // Middleware gom lỗi validate
const { authJwt, requireRole } = require('../../middlewares/auth'); // Middleware đăng nhập và phân quyền theo vai trò

const router = Router(); // Tạo router cho nhóm /books

// Công khai
router.get('/', controller.list); // GET /books: ai cũng xem được danh sách sách
router.get('/:id', param('id').isInt(), validate, controller.detail); // GET /books/:id: kiểm tra id là số nguyên rồi trả chi tiết

// Thủ thư / Admin
router.post( // POST /books: thêm sách mới
  '/', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư hoặc admin được thêm
  [ // Mảng rule kiểm tra
    body('title').trim().notEmpty().withMessage('Tiêu đề không được trống'), // Tiêu đề bắt buộc
    body('totalCopies').optional().isInt({ min: 1 }).withMessage('Số bản phải ≥ 1'), // Nếu có totalCopies thì phải là số nguyên ≥ 1
  ], // Kết thúc rule
  validate, // Kiểm tra lỗi validate
  controller.create // Gọi handler thêm sách
); // Kết thúc route POST

router.put( // PUT /books/:id: cập nhật sách
  '/:id', // Đường dẫn kèm id
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  param('id').isInt(), // id phải là số nguyên
  validate, // Kiểm tra lỗi
  controller.update // Gọi handler cập nhật
); // Kết thúc route PUT

router.patch( // PATCH /books/:id/copies: chỉ cập nhật số lượng bản
  '/:id/copies', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  [param('id').isInt(), body('totalCopies').isInt({ min: 0 })], // id là số nguyên và totalCopies là số nguyên ≥ 0
  validate, // Kiểm tra lỗi
  controller.updateCopies // Gọi handler cập nhật số bản
); // Kết thúc route PATCH

router.delete( // DELETE /books/:id: xóa sách
  '/:id', // Đường dẫn kèm id
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  param('id').isInt(), // id là số nguyên
  validate, // Kiểm tra lỗi
  controller.remove // Gọi handler xóa
); // Kết thúc route DELETE

module.exports = router; // Xuất router để gắn vào /api/books
