const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Thu thập lỗi từ express-validator và trả 400 nếu có.
function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new AppError(400, 'Dữ liệu không hợp lệ', errors));
  }
  return next();
}

module.exports = validate;
