const { Router } = require('express'); // Hàm tạo router con
const { body, param } = require('express-validator'); // Rule kiểm tra dữ liệu body và tham số đường dẫn
const prisma = require('../../config/prisma'); // Client truy vấn DB
const asyncHandler = require('../../utils/asyncHandler'); // Hàm bọc tự bắt lỗi async
const AppError = require('../../utils/AppError'); // Lớp lỗi tùy biến
const { ok, created } = require('../../utils/response'); // Helper trả response 200 và 201
const validate = require('../../middlewares/validate'); // Middleware gom lỗi validate
const { authJwt, requireRole } = require('../../middlewares/auth'); // Middleware đăng nhập và phân quyền

const router = Router(); // Tạo router cho nhóm /categories

router.get( // GET /categories: lấy danh sách thể loại
  '/', // Đường dẫn
  asyncHandler(async (_req, res) => { // Handler (không cần req)
    const items = await prisma.category.findMany({ orderBy: { name: 'asc' } }); // Lấy tất cả thể loại, sắp theo tên A->Z
    return ok(res, items); // Trả danh sách
  }) // Kết thúc handler
); // Kết thúc route GET

router.post( // POST /categories: thêm thể loại
  '/', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  body('name').trim().notEmpty().withMessage('Tên thể loại không được trống'), // name bắt buộc
  validate, // Kiểm tra lỗi
  asyncHandler(async (req, res) => { // Handler thêm
    const item = await prisma.category.create({ data: { name: req.body.name } }); // Tạo thể loại mới
    return created(res, item, 'Đã thêm thể loại'); // Trả 201
  }) // Kết thúc handler
); // Kết thúc route POST

router.put( // PUT /categories/:id: sửa thể loại
  '/:id', // Đường dẫn kèm id
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  [param('id').isInt(), body('name').trim().notEmpty()], // id là số nguyên, name không rỗng
  validate, // Kiểm tra lỗi
  asyncHandler(async (req, res) => { // Handler sửa
    const item = await prisma.category.update({ // Cập nhật thể loại
      where: { id: parseInt(req.params.id, 10) }, // Theo id
      data: { name: req.body.name }, // Đổi tên
    }); // Kết thúc update
    return ok(res, item, 'Đã cập nhật thể loại'); // Trả 200
  }) // Kết thúc handler
); // Kết thúc route PUT

router.delete( // DELETE /categories/:id: xóa thể loại
  '/:id', // Đường dẫn kèm id
  authJwt, // Yêu cầu đăng nhập
  requireRole('ADMIN'), // Chỉ admin được xóa
  param('id').isInt(), // id là số nguyên
  validate, // Kiểm tra lỗi
  asyncHandler(async (req, res) => { // Handler xóa
    const id = parseInt(req.params.id, 10); // Ép id sang số
    const count = await prisma.book.count({ where: { categoryId: id } }); // Đếm số sách thuộc thể loại này
    if (count > 0) throw new AppError(409, 'Không thể xóa: thể loại còn sách'); // Còn sách thì không cho xóa
    await prisma.category.delete({ where: { id } }); // Xóa thể loại
    return ok(res, { deleted: true }, 'Đã xóa thể loại'); // Trả 200 báo đã xóa
  }) // Kết thúc handler
); // Kết thúc route DELETE

module.exports = router; // Xuất router để gắn vào /api/categories
