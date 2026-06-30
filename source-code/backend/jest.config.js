module.exports = { // Cấu hình cho Jest (framework chạy test của backend)
  testEnvironment: 'node', // Môi trường chạy test là Node (không cần trình duyệt)
  testMatch: ['**/tests/**/*.test.js'], // Chỉ chạy các file *.test.js nằm trong thư mục tests
  verbose: true, // In chi tiết từng test case khi chạy
}; // Kết thúc cấu hình
