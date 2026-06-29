const { Router } = require('express');
const { body } = require('express-validator');
const prisma = require('../../config/prisma');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const validate = require('../../middlewares/validate');
const { authJwt, requireRole } = require('../../middlewares/auth');

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await prisma.author.findMany({ orderBy: { name: 'asc' } });
    return ok(res, items);
  })
);

router.post(
  '/',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  body('name').trim().notEmpty().withMessage('Tên tác giả không được trống'),
  validate,
  asyncHandler(async (req, res) => {
    const item = await prisma.author.create({
      data: { name: req.body.name, bio: req.body.bio || null },
    });
    return created(res, item, 'Đã thêm tác giả');
  })
);

module.exports = router;
