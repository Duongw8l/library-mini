require('dotenv').config(); // Đọc file .env và nạp các biến vào process.env

const env = { // Gom toàn bộ cấu hình ứng dụng vào một object để dùng chung
  nodeEnv: process.env.NODE_ENV || 'development', // Môi trường chạy: development/production/test (mặc định development)
  port: parseInt(process.env.PORT || '4000', 10), // Cổng server, ép kiểu số nguyên, mặc định 4000
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me', // Khóa bí mật ký JWT (nên đổi ở production)
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h', // Thời hạn hiệu lực của token JWT (mặc định 24 giờ)
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', // Origin của frontend được phép gọi API (dùng cho CORS)
  // Tham số nghiệp vụ mặc định (fallback nếu chưa có trong bảng settings)
  business: { // Nhóm các tham số quy tắc mượn sách
    maxBooksPerUser: parseInt(process.env.MAX_BOOKS_PER_USER || '5', 10), // Số sách tối đa một người được mượn cùng lúc
    loanDays: parseInt(process.env.LOAN_DAYS || '14', 10), // Số ngày cho mượn mặc định mỗi lượt
    renewDays: parseInt(process.env.RENEW_DAYS || '7', 10), // Số ngày được gia hạn thêm mỗi lần gia hạn
    maxRenewals: parseInt(process.env.MAX_RENEWALS || '2', 10), // Số lần gia hạn tối đa cho một lượt mượn
    finePerDay: parseInt(process.env.FINE_PER_DAY || '5000', 10), // Tiền phạt mỗi ngày trả trễ (đơn vị tiền)
  }, // Kết thúc nhóm tham số nghiệp vụ
}; // Kết thúc object env

module.exports = env; // Xuất cấu hình để các file khác import dùng
