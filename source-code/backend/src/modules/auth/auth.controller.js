const service = require('./auth.service'); // Tầng service chứa logic nghiệp vụ xác thực
const asyncHandler = require('../../utils/asyncHandler'); // Hàm bọc để tự bắt lỗi async
const { ok, created } = require('../../utils/response'); // Helper trả response chuẩn (200 và 201)

const register = asyncHandler(async (req, res) => { // Handler đăng ký tài khoản mới
  const user = await service.register(req.body); // Gọi service tạo user từ dữ liệu gửi lên (req.body)
  return created(res, user, 'Đăng ký thành công'); // Trả 201 kèm thông tin user vừa tạo
}); // Kết thúc register

const login = asyncHandler(async (req, res) => { // Handler đăng nhập
  const result = await service.login(req.body); // Gọi service xác thực và tạo token
  return ok(res, result, 'Đăng nhập thành công'); // Trả 200 kèm token + thông tin user
}); // Kết thúc login

const me = asyncHandler(async (req, res) => { // Handler lấy thông tin người đang đăng nhập
  const user = await service.me(req.user.id); // Lấy user theo id giải mã từ token (req.user.id)
  return ok(res, user); // Trả 200 kèm thông tin user
}); // Kết thúc me

const changePassword = asyncHandler(async (req, res) => { // Handler đổi mật khẩu
  const result = await service.changePassword(req.user.id, req.body); // Gọi service đổi mật khẩu cho user hiện tại
  return ok(res, result, 'Đổi mật khẩu thành công'); // Trả 200 báo đổi thành công
}); // Kết thúc changePassword

module.exports = { register, login, me, changePassword }; // Xuất các handler cho file route sử dụng
