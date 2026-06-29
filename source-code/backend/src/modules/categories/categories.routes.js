const { Router } = require('express');
const { body, param } = require('express-validator');
const prisma = require('../../config/prisma');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const { ok, created } = require('../../utils/response');
const validate = require('../../middlewares/validate');
const { authJwt, requireRole } = require('../../middlewares/auth');

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return ok(res, items);
  })
);

router.post(
  '/',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  body('name').trim().notEmpty().withMessage('Tên thể loại không được trống'),
  validate,
  asyncHandler(async (req, res) => {
    const item = await prisma.category.create({ data: { name: req.body.name } });
    return created(res, item, 'Đã thêm thể loại');
  })
);

router.put(
  '/:id',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  [param('id').isInt(), body('name').trim().notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const item = await prisma.category.update({
      where: { id: parseInt(req.params.id, 10) },
      data: { name: req.body.name },
    });
    return ok(res, item, 'Đã cập nhật thể loại');
  })
);

router.delete(
  '/:id',
  authJwt,
  requireRole('ADMIN'),
  param('id').isInt(),
  validate,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const count = await prisma.book.count({ where: { categoryId: id } });
    if (count > 0) throw new AppError(409, 'Không thể xóa: thể loại còn sách');
    await prisma.category.delete({ where: { id } });
    return ok(res, { deleted: true }, 'Đã xóa thể loại');
  })
);

module.exports = router;
