// Lỗi nghiệp vụ có mã HTTP — ném ra ở tầng service/controller,
// xử lý tập trung ở middleware errorHandler.
class AppError extends Error { // Định nghĩa lớp lỗi tùy biến, kế thừa lớp Error chuẩn của JS
  constructor(statusCode, message, errors = undefined) { // Hàm khởi tạo: nhận mã HTTP, thông điệp lỗi và danh sách lỗi chi tiết (tùy chọn)
    super(message); // Gọi constructor lớp cha để gán message cho lỗi
    this.statusCode = statusCode; // Lưu mã trạng thái HTTP (vd 400, 404, 409...) để trả về client
    this.errors = errors; // Lưu danh sách lỗi chi tiết (vd lỗi từng field khi validate)
    this.isOperational = true; // Đánh dấu đây là lỗi "có chủ đích" (lỗi nghiệp vụ), không phải bug hệ thống
    Error.captureStackTrace(this, this.constructor); // Tạo stack trace gọn, bỏ qua chính constructor này
  } // Kết thúc constructor
} // Kết thúc lớp AppError

module.exports = AppError; // Xuất lớp AppError để các nơi ném lỗi sử dụng
