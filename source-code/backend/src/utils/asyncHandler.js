// Bọc handler async để tự động chuyển lỗi sang middleware xử lý lỗi,
// tránh phải viết try/catch lặp lại ở mọi controller.
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
