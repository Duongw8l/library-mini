const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
if (env.nodeEnv !== 'test') app.use(morgan('dev'));

// Healthcheck
app.get('/api/health', (_req, res) =>
  res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } })
);

app.use('/api', apiRoutes);

// --- Phục vụ frontend tĩnh (deploy 1 service, vd: Railway) ---
// Chỉ kích hoạt khi tồn tại thư mục ./public (bản build frontend được copy vào lúc build image).
// Khi chạy dev cục bộ (không có public) thì bỏ qua, frontend chạy riêng bằng Vite.
const publicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  // SPA fallback: mọi route KHÔNG bắt đầu bằng /api/ đều trả index.html
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

// 404 + xử lý lỗi tập trung
app.use(notFound);
app.use(errorHandler);

module.exports = app;
