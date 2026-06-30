const { validationResult } = require('express-validator'); // Hàm lấy kết quả kiểm tra dữ liệu của express-validator
const AppError = require('../utils/AppError'); // Lớp lỗi tùy biến

// Thu thập lỗi từ express-validator và trả 400 nếu có.
function validate(req, _res, next) { // Middleware chạy sau các rule kiểm tra dữ liệu
  const result = validationResult(req); // Lấy tất cả lỗi validate gắn trên request
  if (!result.isEmpty()) { // Nếu có ít nhất một lỗi
    const errors = result.array().map((e) => ({ field: e.path, message: e.msg })); // Chuyển mỗi lỗi thành { field, message } cho gọn
    return next(new AppError(400, 'Dữ liệu không hợp lệ', errors)); // Trả lỗi 400 kèm danh sách lỗi chi tiết
  } // Kết thúc nhánh có lỗi
  return next(); // Không lỗi -> đi tiếp tới controller
} // Kết thúc validate

module.exports = validate; // Xuất middleware để các route gắn sau bộ rule kiểm tra
