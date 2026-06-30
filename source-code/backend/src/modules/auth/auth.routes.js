const { Router } = require('express'); // Hàm tạo router con của Express
const { body } = require('express-validator'); // Hàm tạo rule kiểm tra dữ liệu trong body request
const controller = require('./auth.controller'); // Các handler xử lý của module auth
const validate = require('../../middlewares/validate'); // Middleware gom lỗi validate và trả 400
const { authJwt } = require('../../middlewares/auth'); // Middleware bắt buộc đăng nhập (kiểm tra token)

const router = Router(); // Tạo router cho nhóm /auth

router.post( // Định nghĩa route POST /auth/register
  '/register', // Đường dẫn đăng ký
  [ // Mảng các rule kiểm tra dữ liệu
    body('fullName').trim().notEmpty().withMessage('Họ tên không được trống'), // fullName: bỏ khoảng trắng thừa, không được rỗng
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(), // email: phải đúng định dạng email và được chuẩn hóa
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'), // password: tối thiểu 6 ký tự
  ], // Kết thúc mảng rule
  validate, // Kiểm tra kết quả validate, lỗi thì dừng trả 400
  controller.register // Nếu hợp lệ -> gọi handler đăng ký
); // Kết thúc route register

router.post( // Định nghĩa route POST /auth/login
  '/login', // Đường dẫn đăng nhập
  [ // Mảng rule kiểm tra
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(), // email đúng định dạng và chuẩn hóa
    body('password').notEmpty().withMessage('Mật khẩu không được trống'), // password không được rỗng
  ], // Kết thúc rule
  validate, // Kiểm tra lỗi validate
  controller.login // Gọi handler đăng nhập
); // Kết thúc route login

router.get('/me', authJwt, controller.me); // GET /auth/me: cần đăng nhập (authJwt) rồi trả thông tin bản thân

router.put( // Định nghĩa route PUT /auth/change-password
  '/change-password', // Đường dẫn đổi mật khẩu
  authJwt, // Yêu cầu đã đăng nhập
  [ // Mảng rule kiểm tra
    body('oldPassword').notEmpty(), // Mật khẩu cũ không được rỗng
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự'), // Mật khẩu mới tối thiểu 6 ký tự
  ], // Kết thúc rule
  validate, // Kiểm tra lỗi validate
  controller.changePassword // Gọi handler đổi mật khẩu
); // Kết thúc route change-password

module.exports = router; // Xuất router để routes.js gắn vào /api/auth
