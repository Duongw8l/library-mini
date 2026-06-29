const { Router } = require('express');
const { body, param } = require('express-validator');
const controller = require('./books.controller');
const validate = require('../../middlewares/validate');
const { authJwt, requireRole } = require('../../middlewares/auth');

const router = Router();

// Công khai
router.get('/', controller.list);
router.get('/:id', param('id').isInt(), validate, controller.detail);

// Thủ thư / Admin
router.post(
  '/',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  [
    body('title').trim().notEmpty().withMessage('Tiêu đề không được trống'),
    body('totalCopies').optional().isInt({ min: 1 }).withMessage('Số bản phải ≥ 1'),
  ],
  validate,
  controller.create
);

router.put(
  '/:id',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  param('id').isInt(),
  validate,
  controller.update
);

router.patch(
  '/:id/copies',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  [param('id').isInt(), body('totalCopies').isInt({ min: 0 })],
  validate,
  controller.updateCopies
);

router.delete(
  '/:id',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  param('id').isInt(),
  validate,
  controller.remove
);

module.exports = router;
