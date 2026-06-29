const AppError = require('../utils/AppError');

// 404 cho route không tồn tại.
function notFound(req, _res, next) {
  next(new AppError(404, `Không tìm thấy đường dẫn: ${req.originalUrl}`));
}

// Xử lý lỗi tập trung.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ';

  // Lỗi ràng buộc unique của Prisma
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'trường';
    message = `Giá trị '${field}' đã tồn tại`;
  }
  // Bản ghi không tồn tại
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Bản ghi không tồn tại';
  }

  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    // Ghi log lỗi không lường trước
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors,
  });
}

module.exports = { notFound, errorHandler };
