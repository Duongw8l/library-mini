const { Router } = require('express'); // Hàm tạo router con
const service = require('./settings.service'); // Service đọc/ghi cấu hình
const asyncHandler = require('../../utils/asyncHandler'); // Hàm bọc tự bắt lỗi async
const { ok } = require('../../utils/response'); // Helper trả response 200
const { authJwt, requireRole } = require('../../middlewares/auth'); // Middleware đăng nhập và phân quyền

const router = Router(); // Tạo router cho nhóm /settings

router.get( // GET /settings: xem cấu hình
  '/', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin xem được
  asyncHandler(async (_req, res) => ok(res, await service.getAll())) // Lấy toàn bộ cấu hình và trả về
); // Kết thúc route GET

router.put( // PUT /settings: cập nhật cấu hình
  '/', // Đường dẫn
  authJwt, // Yêu cầu đăng nhập
  requireRole('ADMIN'), // Chỉ admin được sửa
  asyncHandler(async (req, res) => ok(res, await service.update(req.body), 'Đã cập nhật cấu hình')) // Cập nhật theo dữ liệu gửi lên và trả kết quả
); // Kết thúc route PUT

module.exports = router; // Xuất router để gắn vào /api/settings
