const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('./auth.controller');
const validate = require('../../middlewares/validate');
const { authJwt } = require('../../middlewares/auth');

const router = Router();

router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('Họ tên không được trống'),
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
  ],
  validate,
  controller.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').notEmpty().withMessage('Mật khẩu không được trống'),
  ],
  validate,
  controller.login
);

router.get('/me', authJwt, controller.me);

router.put(
  '/change-password',
  authJwt,
  [
    body('oldPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự'),
  ],
  validate,
  controller.changePassword
);

module.exports = router;
