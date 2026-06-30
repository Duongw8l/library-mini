const AppError = require('../utils/AppError'); // Lớp lỗi tùy biến

// 404 cho route không tồn tại.
function notFound(req, _res, next) { // Middleware chạy khi không route nào khớp
  next(new AppError(404, `Không tìm thấy đường dẫn: ${req.originalUrl}`)); // Tạo lỗi 404 kèm URL người dùng gọi và chuyển cho errorHandler
} // Kết thúc notFound

// Xử lý lỗi tập trung.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) { // Middleware lỗi (4 tham số) bắt mọi lỗi của ứng dụng
  let statusCode = err.statusCode || 500; // Lấy mã HTTP từ lỗi; nếu không có thì coi là 500 (lỗi server)
  let message = err.message || 'Lỗi máy chủ nội bộ'; // Lấy thông điệp lỗi; nếu không có dùng mặc định

  // Lỗi ràng buộc unique của Prisma
  if (err.code === 'P2002') { // Mã P2002 = vi phạm ràng buộc duy nhất (trùng dữ liệu)
    statusCode = 409; // Đổi sang 409 (xung đột)
    const field = err.meta?.target?.[0] || 'trường'; // Lấy tên trường bị trùng (nếu Prisma cung cấp)
    message = `Giá trị '${field}' đã tồn tại`; // Tạo thông điệp dễ hiểu cho người dùng
  } // Kết thúc xử lý P2002
  // Bản ghi không tồn tại
  if (err.code === 'P2025') { // Mã P2025 = thao tác trên bản ghi không tồn tại
    statusCode = 404; // Đổi sang 404 (không tìm thấy)
    message = 'Bản ghi không tồn tại'; // Thông điệp tương ứng
  } // Kết thúc xử lý P2025

  if (statusCode === 500 && process.env.NODE_ENV !== 'test') { // Nếu là lỗi server thật và không phải lúc chạy test
    // Ghi log lỗi không lường trước
    // eslint-disable-next-line no-console
    console.error(err); // In chi tiết lỗi ra console để lập trình viên debug
  } // Kết thúc log lỗi

  res.status(statusCode).json({ // Trả phản hồi lỗi cho client theo định dạng thống nhất
    success: false, // Cờ báo thất bại
    message, // Thông điệp lỗi
    errors: err.errors, // Danh sách lỗi chi tiết (nếu có, vd lỗi validate từng field)
  }); // Kết thúc trả JSON
} // Kết thúc errorHandler

module.exports = { notFound, errorHandler }; // Xuất 2 middleware để app.js sử dụng ở cuối chuỗi
