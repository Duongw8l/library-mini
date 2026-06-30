// Bọc handler async để tự động chuyển lỗi sang middleware xử lý lỗi,
// tránh phải viết try/catch lặp lại ở mọi controller.
module.exports = (fn) => (req, res, next) => // Nhận một hàm xử lý fn, trả về một middleware Express mới
  Promise.resolve(fn(req, res, next)).catch(next); // Gọi fn, bọc kết quả thành Promise; nếu lỗi thì chuyển cho next() (errorHandler)
