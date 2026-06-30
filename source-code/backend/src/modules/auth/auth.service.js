const bcrypt = require('bcryptjs'); // Thư viện băm và so khớp mật khẩu
const jwt = require('jsonwebtoken'); // Thư viện tạo/giải mã token JWT
const prisma = require('../../config/prisma'); // Client truy vấn cơ sở dữ liệu
const env = require('../../config/env'); // Cấu hình (secret, thời hạn token...)
const AppError = require('../../utils/AppError'); // Lớp lỗi tùy biến

const SALT_ROUNDS = 10; // Số vòng "muối" khi băm mật khẩu (càng cao càng an toàn nhưng chậm hơn)

function sign(user) { // Hàm tạo token JWT cho một user
  return jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { // Đưa id và role vào payload, ký bằng secret
    expiresIn: env.jwtExpiresIn, // Đặt thời hạn hết hiệu lực cho token
  }); // Kết thúc jwt.sign
} // Kết thúc hàm sign

function publicUser(u) { // Hàm lọc bỏ thông tin nhạy cảm, chỉ giữ trường an toàn để trả ra ngoài
  return { id: u.id, fullName: u.fullName, email: u.email, role: u.role, active: u.active }; // Trả về object user không kèm mật khẩu
} // Kết thúc publicUser

async function register({ fullName, email, password }) { // Nghiệp vụ đăng ký, nhận họ tên/email/mật khẩu
  const existing = await prisma.user.findUnique({ where: { email } }); // Tìm xem email đã tồn tại chưa
  if (existing) throw new AppError(409, 'Email đã được sử dụng'); // Nếu đã có -> báo lỗi trùng (409)

  const hashed = await bcrypt.hash(password, SALT_ROUNDS); // Băm mật khẩu trước khi lưu (không lưu mật khẩu gốc)
  const user = await prisma.user.create({ // Tạo bản ghi user mới trong DB
    data: { fullName, email, password: hashed, role: 'STUDENT' }, // Lưu thông tin, mặc định vai trò là STUDENT (sinh viên)
  }); // Kết thúc tạo user
  return publicUser(user); // Trả về thông tin user đã lọc (không có mật khẩu)
} // Kết thúc register

async function login({ email, password }) { // Nghiệp vụ đăng nhập
  const user = await prisma.user.findUnique({ where: { email } }); // Tìm user theo email
  if (!user) throw new AppError(401, 'Email hoặc mật khẩu không đúng'); // Không có user -> báo sai (không nói rõ sai gì cho an toàn)
  if (!user.active) throw new AppError(403, 'Tài khoản đã bị khóa'); // Tài khoản bị vô hiệu hóa -> chặn (403)

  const match = await bcrypt.compare(password, user.password); // So mật khẩu nhập với mật khẩu đã băm trong DB
  if (!match) throw new AppError(401, 'Email hoặc mật khẩu không đúng'); // Không khớp -> báo sai

  return { token: sign(user), user: publicUser(user) }; // Đúng -> trả token mới và thông tin user
} // Kết thúc login

async function me(userId) { // Nghiệp vụ lấy thông tin user theo id
  const user = await prisma.user.findUnique({ where: { id: userId } }); // Tìm user theo id
  if (!user) throw new AppError(404, 'Không tìm thấy người dùng'); // Không có -> 404
  return publicUser(user); // Trả thông tin đã lọc
} // Kết thúc me

async function changePassword(userId, { oldPassword, newPassword }) { // Nghiệp vụ đổi mật khẩu
  const user = await prisma.user.findUnique({ where: { id: userId } }); // Tìm user
  if (!user) throw new AppError(404, 'Không tìm thấy người dùng'); // Không có -> 404

  const match = await bcrypt.compare(oldPassword, user.password); // Kiểm tra mật khẩu cũ có đúng không
  if (!match) throw new AppError(400, 'Mật khẩu cũ không đúng'); // Sai mật khẩu cũ -> 400

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS); // Băm mật khẩu mới
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } }); // Cập nhật mật khẩu mới vào DB
  return { changed: true }; // Báo đã đổi thành công
} // Kết thúc changePassword

module.exports = { register, login, me, changePassword, publicUser }; // Xuất các hàm nghiệp vụ (publicUser dùng lại ở module khác)
