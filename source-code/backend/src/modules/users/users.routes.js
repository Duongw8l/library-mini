const { Router } = require('express'); // Hàm tạo router con
const { body, param } = require('express-validator'); // Rule kiểm tra body và tham số đường dẫn
const bcrypt = require('bcryptjs'); // Thư viện băm mật khẩu
const prisma = require('../../config/prisma'); // Client truy vấn DB
const asyncHandler = require('../../utils/asyncHandler'); // Hàm bọc tự bắt lỗi async
const AppError = require('../../utils/AppError'); // Lớp lỗi tùy biến
const { ok, created } = require('../../utils/response'); // Helper trả response 200 và 201
const validate = require('../../middlewares/validate'); // Middleware gom lỗi validate
const { authJwt, requireRole } = require('../../middlewares/auth'); // Middleware đăng nhập và phân quyền

const router = Router(); // Tạo router cho nhóm /users
const ROLES = ['STUDENT', 'LIBRARIAN', 'ADMIN']; // Danh sách vai trò hợp lệ trong hệ thống

const pub = (u) => ({ // Hàm lọc bỏ thông tin nhạy cảm (mật khẩu) trước khi trả ra
  id: u.id, // Mã người dùng
  fullName: u.fullName, // Họ tên
  email: u.email, // Email
  role: u.role, // Vai trò
  active: u.active, // Trạng thái kích hoạt (true=hoạt động, false=bị khóa)
  createdAt: u.createdAt, // Ngày tạo tài khoản
}); // Kết thúc pub

// Yêu cầu đăng nhập cho mọi endpoint; quyền cụ thể đặt ở từng route.
router.use(authJwt); // Mọi route trong file này đều bắt buộc đã đăng nhập

// FR-40: liệt kê / tìm kiếm người dùng (Thủ thư xem được danh sách độc giả; Admin xem tất cả)
router.get( // GET /users: danh sách người dùng (có tìm kiếm/lọc)
  '/', // Đường dẫn
  requireRole('LIBRARIAN', 'ADMIN'), // Chỉ thủ thư/admin
  asyncHandler(async (req, res) => { // Handler
    const { q, role } = req.query; // Lấy từ khóa tìm kiếm và vai trò cần lọc từ URL
    const where = { AND: [] }; // Khởi tạo điều kiện lọc (gom bằng AND)
    if (q) { // Nếu có từ khóa
      where.AND.push({ // Thêm điều kiện tìm theo tên hoặc email
        OR: [ // Khớp 1 trong 2 trường
          { fullName: { contains: q, mode: 'insensitive' } }, // Tên chứa từ khóa (không phân biệt hoa/thường)
          { email: { contains: q, mode: 'insensitive' } }, // Hoặc email chứa từ khóa
        ], // Kết thúc OR
      }); // Kết thúc push
    } // Kết thúc nhánh q
    if (role && ROLES.includes(role)) where.AND.push({ role }); // Nếu lọc theo vai trò hợp lệ thì thêm điều kiện
    const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } }); // Lấy danh sách user, mới nhất trước
    return ok(res, users.map(pub)); // Trả danh sách đã lọc bỏ mật khẩu
  }) // Kết thúc handler
); // Kết thúc route GET

// FR-41: tạo tài khoản (gán role)
router.post( // POST /users: admin tạo tài khoản mới
  '/', // Đường dẫn
  requireRole('ADMIN'), // Chỉ admin
  [ // Mảng rule kiểm tra
    body('fullName').trim().notEmpty(), // Họ tên bắt buộc
    body('email').isEmail().normalizeEmail(), // Email hợp lệ và chuẩn hóa
    body('password').isLength({ min: 6 }), // Mật khẩu tối thiểu 6 ký tự
    body('role').optional().isIn(ROLES), // Vai trò (nếu có) phải nằm trong danh sách hợp lệ
  ], // Kết thúc rule
  validate, // Kiểm tra lỗi
  asyncHandler(async (req, res) => { // Handler tạo
    const { fullName, email, password, role } = req.body; // Lấy dữ liệu từ body
    const hashed = await bcrypt.hash(password, 10); // Băm mật khẩu trước khi lưu
    const user = await prisma.user.create({ // Tạo user
      data: { fullName, email, password: hashed, role: role || 'STUDENT' }, // Mặc định vai trò STUDENT nếu không truyền
    }); // Kết thúc create
    return created(res, pub(user), 'Đã tạo tài khoản'); // Trả 201 kèm user (đã lọc)
  }) // Kết thúc handler
); // Kết thúc route POST

router.put( // PUT /users/:id: cập nhật thông tin user
  '/:id', // Đường dẫn kèm id
  requireRole('ADMIN'), // Chỉ admin
  [param('id').isInt(), body('fullName').optional().notEmpty()], // id là số nguyên; nếu có fullName thì không rỗng
  validate, // Kiểm tra lỗi
  asyncHandler(async (req, res) => { // Handler cập nhật
    const user = await prisma.user.update({ // Cập nhật user
      where: { id: parseInt(req.params.id, 10) }, // Theo id
      data: { fullName: req.body.fullName, email: req.body.email }, // Đổi họ tên và email
    }); // Kết thúc update
    return ok(res, pub(user), 'Đã cập nhật'); // Trả user sau cập nhật
  }) // Kết thúc handler
); // Kết thúc route PUT

// FR-42: đổi vai trò
router.patch( // PATCH /users/:id/role: đổi vai trò
  '/:id/role', // Đường dẫn
  requireRole('ADMIN'), // Chỉ admin
  [param('id').isInt(), body('role').isIn(ROLES)], // id là số nguyên; role phải hợp lệ
  validate, // Kiểm tra lỗi
  asyncHandler(async (req, res) => { // Handler đổi vai trò
    const user = await prisma.user.update({ // Cập nhật user
      where: { id: parseInt(req.params.id, 10) }, // Theo id
      data: { role: req.body.role }, // Đổi vai trò
    }); // Kết thúc update
    return ok(res, pub(user), 'Đã đổi vai trò'); // Trả user sau cập nhật
  }) // Kết thúc handler
); // Kết thúc route PATCH role

// Khóa / mở khóa
router.patch( // PATCH /users/:id/status: khóa hoặc mở khóa tài khoản
  '/:id/status', // Đường dẫn
  requireRole('ADMIN'), // Chỉ admin
  [param('id').isInt(), body('active').isBoolean()], // id là số nguyên; active là true/false
  validate, // Kiểm tra lỗi
  asyncHandler(async (req, res) => { // Handler
    const id = parseInt(req.params.id, 10); // Ép id sang số
    if (id === req.user.id) throw new AppError(409, 'Không thể tự khóa tài khoản của mình'); // Không cho admin tự khóa chính mình
    const user = await prisma.user.update({ where: { id }, data: { active: req.body.active } }); // Cập nhật trạng thái
    return ok(res, pub(user), req.body.active ? 'Đã mở khóa' : 'Đã khóa'); // Thông điệp tùy theo mở/khóa
  }) // Kết thúc handler
); // Kết thúc route PATCH status

module.exports = router; // Xuất router để gắn vào /api/users
