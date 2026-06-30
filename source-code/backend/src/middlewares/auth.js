const jwt = require('jsonwebtoken'); // Thư viện tạo/giải mã JSON Web Token
const env = require('../config/env'); // Cấu hình ứng dụng (chứa jwtSecret)
const AppError = require('../utils/AppError'); // Lớp lỗi tùy biến để ném lỗi có mã HTTP

// Xác thực JWT: gắn req.user = { id, role } nếu token hợp lệ.
function authJwt(req, _res, next) { // Middleware kiểm tra đăng nhập qua token
  const header = req.headers.authorization || ''; // Lấy header Authorization (nếu không có thì chuỗi rỗng)
  const token = header.startsWith('Bearer ') ? header.slice(7) : null; // Nếu header dạng "Bearer <token>" thì cắt lấy phần token, ngược lại null
  if (!token) return next(new AppError(401, 'Chưa đăng nhập (thiếu token)')); // Không có token -> trả lỗi 401 (chưa xác thực)

  try { // Thử giải mã token
    const payload = jwt.verify(token, env.jwtSecret); // Xác minh chữ ký token bằng secret; trả về payload đã giải mã
    req.user = { id: payload.id, role: payload.role }; // Gắn thông tin user (id, vai trò) vào request cho các bước sau dùng
    return next(); // Token hợp lệ -> đi tiếp
  } catch (_e) { // Nếu token sai chữ ký hoặc hết hạn
    return next(new AppError(401, 'Token không hợp lệ hoặc đã hết hạn')); // Trả lỗi 401
  } // Kết thúc try/catch
} // Kết thúc authJwt

// Phân quyền theo vai trò (RBAC). Dùng sau authJwt.
function requireRole(...roles) { // Hàm tạo middleware; nhận danh sách vai trò được phép
  return (req, _res, next) => { // Trả về middleware thực sự
    if (!req.user) return next(new AppError(401, 'Chưa đăng nhập')); // Chưa qua authJwt (không có req.user) -> 401
    if (!roles.includes(req.user.role)) { // Vai trò của user không nằm trong danh sách cho phép
      return next(new AppError(403, 'Bạn không có quyền thực hiện thao tác này')); // -> lỗi 403 (bị cấm)
    } // Kết thúc kiểm tra vai trò
    return next(); // Đủ quyền -> đi tiếp
  }; // Kết thúc middleware trả về
} // Kết thúc requireRole

module.exports = { authJwt, requireRole }; // Xuất 2 middleware để các route bảo vệ endpoint
