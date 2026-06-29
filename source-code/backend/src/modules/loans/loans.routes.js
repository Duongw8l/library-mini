const { Router } = require('express');
const { body, param } = require('express-validator');
const controller = require('./loans.controller');
const validate = require('../../middlewares/validate');
const { authJwt, requireRole } = require('../../middlewares/auth');

const router = Router();

// Sinh viên
router.post(
  '/',
  authJwt,
  requireRole('STUDENT'),
  body('bookId').isInt().withMessage('bookId không hợp lệ'),
  validate,
  controller.request
);
router.get('/my', authJwt, requireRole('STUDENT'), controller.my);
router.patch('/:id/renew', authJwt, requireRole('STUDENT'), param('id').isInt(), validate, controller.renew);

// Thủ thư / Admin
router.get('/', authJwt, requireRole('LIBRARIAN', 'ADMIN'), controller.list);
router.get('/overdue', authJwt, requireRole('LIBRARIAN', 'ADMIN'), controller.overdue);
router.patch('/:id/approve', authJwt, requireRole('LIBRARIAN', 'ADMIN'), param('id').isInt(), validate, controller.approve);
router.patch(
  '/:id/reject',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  [param('id').isInt(), body('reason').optional().isString()],
  validate,
  controller.reject
);
router.patch('/:id/return', authJwt, requireRole('LIBRARIAN', 'ADMIN'), param('id').isInt(), validate, controller.returnBook);

module.exports = router;
