const { PrismaClient } = require('@prisma/client'); // Lấy lớp PrismaClient - công cụ truy vấn cơ sở dữ liệu

// Tái sử dụng một instance Prisma duy nhất cho toàn ứng dụng.
const prisma = new PrismaClient({ // Khởi tạo một client Prisma dùng chung (tránh tạo nhiều kết nối DB)
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'], // Ở dev thì log cả warn+error; môi trường khác chỉ log error
}); // Kết thúc khởi tạo PrismaClient

module.exports = prisma; // Xuất instance prisma để mọi service dùng chung
