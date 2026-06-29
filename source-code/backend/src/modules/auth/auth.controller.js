const service = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');

const register = asyncHandler(async (req, res) => {
  const user = await service.register(req.body);
  return created(res, user, 'Đăng ký thành công');
});

const login = asyncHandler(async (req, res) => {
  const result = await service.login(req.body);
  return ok(res, result, 'Đăng nhập thành công');
});

const me = asyncHandler(async (req, res) => {
  const user = await service.me(req.user.id);
  return ok(res, user);
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await service.changePassword(req.user.id, req.body);
  return ok(res, result, 'Đổi mật khẩu thành công');
});

module.exports = { register, login, me, changePassword };
