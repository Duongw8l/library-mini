const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

// Xác thực JWT: gắn req.user = { id, role } nếu token hợp lệ.
function authJwt(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError(401, 'Chưa đăng nhập (thiếu token)'));

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (_e) {
    return next(new AppError(401, 'Token không hợp lệ hoặc đã hết hạn'));
  }
}

// Phân quyền theo vai trò (RBAC). Dùng sau authJwt.
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError(401, 'Chưa đăng nhập'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Bạn không có quyền thực hiện thao tác này'));
    }
    return next();
  };
}

module.exports = { authJwt, requireRole };
