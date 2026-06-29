require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  // Tham số nghiệp vụ mặc định (fallback nếu chưa có trong bảng settings)
  business: {
    maxBooksPerUser: parseInt(process.env.MAX_BOOKS_PER_USER || '5', 10),
    loanDays: parseInt(process.env.LOAN_DAYS || '14', 10),
    renewDays: parseInt(process.env.RENEW_DAYS || '7', 10),
    maxRenewals: parseInt(process.env.MAX_RENEWALS || '2', 10),
    finePerDay: parseInt(process.env.FINE_PER_DAY || '5000', 10),
  },
};

module.exports = env;
