const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');

const SALT_ROUNDS = 10;

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function publicUser(u) {
  return { id: u.id, fullName: u.fullName, email: u.email, role: u.role, active: u.active };
}

async function register({ fullName, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, 'Email đã được sử dụng');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { fullName, email, password: hashed, role: 'STUDENT' },
  });
  return publicUser(user);
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(401, 'Email hoặc mật khẩu không đúng');
  if (!user.active) throw new AppError(403, 'Tài khoản đã bị khóa');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError(401, 'Email hoặc mật khẩu không đúng');

  return { token: sign(user), user: publicUser(user) };
}

async function me(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Không tìm thấy người dùng');
  return publicUser(user);
}

async function changePassword(userId, { oldPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Không tìm thấy người dùng');

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) throw new AppError(400, 'Mật khẩu cũ không đúng');

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { changed: true };
}

module.exports = { register, login, me, changePassword, publicUser };
