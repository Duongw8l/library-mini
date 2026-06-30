const path = require('path'); // Module Node để xử lý đường dẫn file/thư mục theo từng hệ điều hành
const fs = require('fs'); // Module Node để thao tác với hệ thống file (đọc/ghi/kiểm tra tồn tại)
const express = require('express'); // Framework web Express để tạo server và định tuyến HTTP
const cors = require('cors'); // Middleware bật CORS (cho phép frontend khác origin gọi API)
const morgan = require('morgan'); // Middleware ghi log mỗi request HTTP ra console
const env = require('./config/env'); // Cấu hình ứng dụng (port, origin client, môi trường...)
const apiRoutes = require('./routes'); // Bộ định tuyến tổng hợp tất cả route /api của ứng dụng
const { notFound, errorHandler } = require('./middlewares/errorHandler'); // Lấy 2 middleware: xử lý 404 và xử lý lỗi tập trung

const app = express(); // Tạo một ứng dụng Express mới

app.use(cors({ origin: env.clientOrigin, credentials: true })); // Bật CORS: chỉ cho origin của client và cho phép gửi cookie/credentials
app.use(express.json()); // Tự động parse body request dạng JSON thành object JS (req.body)
if (env.nodeEnv !== 'test') app.use(morgan('dev')); // Bật log request kiểu 'dev'; tắt khi chạy test cho đỡ nhiễu

// Healthcheck
app.get('/api/health', (_req, res) => // Định nghĩa route GET /api/health để kiểm tra server còn sống không
  res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } }) // Trả JSON báo ok kèm thời gian hiện tại
); // Kết thúc route health

app.use('/api', apiRoutes); // Gắn toàn bộ route nghiệp vụ dưới tiền tố /api

// --- Phục vụ frontend tĩnh (deploy 1 service, vd: Railway) ---
// Chỉ kích hoạt khi tồn tại thư mục ./public (bản build frontend được copy vào lúc build image).
// Khi chạy dev cục bộ (không có public) thì bỏ qua, frontend chạy riêng bằng Vite.
const publicDir = path.join(__dirname, '..', 'public'); // Tính đường dẫn tuyệt đối tới thư mục public (chứa bản build frontend)
if (fs.existsSync(publicDir)) { // Nếu thư mục public tồn tại (đang deploy gộp frontend + backend)
  app.use(express.static(publicDir)); // Phục vụ các file tĩnh (HTML/CSS/JS, ảnh...) từ thư mục public
  // SPA fallback: mọi route KHÔNG bắt đầu bằng /api/ đều trả index.html
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html'))); // Mọi URL không phải /api/ đều trả index.html để React Router tự xử lý
} // Kết thúc nhánh phục vụ frontend tĩnh

// 404 + xử lý lỗi tập trung
app.use(notFound); // Nếu không route nào khớp -> middleware trả lỗi 404
app.use(errorHandler); // Middleware cuối cùng bắt mọi lỗi và trả về phản hồi lỗi thống nhất

module.exports = app; // Xuất app để server.js sử dụng (và test có thể import)
