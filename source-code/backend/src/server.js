const app = require('./app'); // Nạp đối tượng Express app đã được cấu hình sẵn từ file app.js
const env = require('./config/env'); // Nạp các biến môi trường/cấu hình (port, secret...) từ config/env.js

app.listen(env.port, () => { // Khởi động server, lắng nghe HTTP trên cổng env.port; callback chạy khi server sẵn sàng
  // eslint-disable-next-line no-console
  console.log(`🚀 Library API đang chạy tại http://localhost:${env.port}/api`); // In log báo server đã chạy và địa chỉ API
  // eslint-disable-next-line no-console
  console.log(`   Healthcheck: http://localhost:${env.port}/api/health`); // In thêm địa chỉ endpoint kiểm tra sức khỏe (health)
}); // Kết thúc lời gọi app.listen
