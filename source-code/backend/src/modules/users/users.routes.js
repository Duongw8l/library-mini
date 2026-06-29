const { Router } = require('express');
const { body, param } = require('express-validator');
const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const { ok, created } = require('../../utils/response');
const validate = require('../../middlewares/validate');
const { authJwt, requireRole } = require('../../middlewares/auth');

const router = Router();
const ROLES = ['STUDENT', 'LIBRARIAN', 'ADMIN'];

const pub = (u) => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
  active: u.active,
  createdAt: u.createdAt,
});

// Yêu cầu đăng nhập cho mọi endpoint; quyền cụ thể đặt ở từng route.
router.use(authJwt);

// FR-40: liệt kê / tìm kiếm người dùng (Thủ thư xem được danh sách độc giả; Admin xem tất cả)
router.get(
  '/',
  requireRole('LIBRARIAN', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { q, role } = req.query;
    const where = { AND: [] };
    if (q) {
      where.AND.push({
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      });
    }
    if (role && ROLES.includes(role)) where.AND.push({ role });
    const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } });
    return ok(res, users.map(pub));
  })
);

// FR-41: tạo tài khoản (gán role)
router.post(
  '/',
  requireRole('ADMIN'),
  [
    body('fullName').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(ROLES),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { fullName, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, password: hashed, role: role || 'STUDENT' },
    });
    return created(res, pub(user), 'Đã tạo tài khoản');
  })
);

router.put(
  '/:id',
  requireRole('ADMIN'),
  [param('id').isInt(), body('fullName').optional().notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id, 10) },
      data: { fullName: req.body.fullName, email: req.body.email },
    });
    return ok(res, pub(user), 'Đã cập nhật');
  })
);

// FR-42: đổi vai trò
router.patch(
  '/:id/role',
  requireRole('ADMIN'),
  [param('id').isInt(), body('role').isIn(ROLES)],
  validate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id, 10) },
      data: { role: req.body.role },
    });
    return ok(res, pub(user), 'Đã đổi vai trò');
  })
);

// Khóa / mở khóa
router.patch(
  '/:id/status',
  requireRole('ADMIN'),
  [param('id').isInt(), body('active').isBoolean()],
  validate,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (id === req.user.id) throw new AppError(409, 'Không thể tự khóa tài khoản của mình');
    const user = await prisma.user.update({ where: { id }, data: { active: req.body.active } });
    return ok(res, pub(user), req.body.active ? 'Đã mở khóa' : 'Đã khóa');
  })
);

module.exports = router;
