const { Router } = require('express'); // Hàm tạo router con
const { body } = require('express-validator'); // Rule kiểm tra dữ liệu body
const prisma = require('../../config/prisma'); // Client truy vấn DB
const asyncHandler = require('../../utils/asyncHandler'); // Hàm bọc tự bắt lỗi async
const { ok, created } = require('../../utils/response'); // Helper trả response 200 và 201
const validate = require('../../middlewares/validate'); // Middleware gom lỗi validate
const { authJwt, requireRole } = require('../../middlewares/auth'); // Middleware đăng nhập và phân quyền

const router = Router(); // Tạo router cho nhóm /authors

router.get( // GET /authors: lấy danh sách tác giả
  '/', // Đường dẫn
  asyncHandler(async (_req, res) => { // Handler
    const items = await prisma.author.findMany({ orderBy: { name: 'asc' } }); // Lấy tất cả tác giả, sắp theo tên A->Z
    return ok(res, items); // Trả danh sách
  }) // Kết thúc handler
); // Kết thúc route GET

router.post( // POST /authors: thêm tác giả
  '/', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  body('name').trim().notEmpty().withMessage('Tên tác giả không được trống'), // name bắt buộc
  validate, // Kiểm tra lỗi
  asyncHandler(async (req, res) => { // Handler thêm
    const item = await prisma.author.create({ // Tạo tác giả mới
      data: { name: req.body.name, bio: req.body.bio || null }, // Lưu tên và tiểu sử (rỗng -> null)
    }); // Kết thúc create
    return created(res, item, 'Đã thêm tác giả'); // Trả 201
  }) // Kết thúc handler
); // Kết thúc route POST

module.exports = router; // Xuất router để gắn vào /api/authors
