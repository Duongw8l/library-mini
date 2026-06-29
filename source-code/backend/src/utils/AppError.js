// Lỗi nghiệp vụ có mã HTTP — ném ra ở tầng service/controller,
// xử lý tập trung ở middleware errorHandler.
class AppError extends Error {
  constructor(statusCode, message, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
