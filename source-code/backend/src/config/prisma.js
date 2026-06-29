const { PrismaClient } = require('@prisma/client');

// Tái sử dụng một instance Prisma duy nhất cho toàn ứng dụng.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
