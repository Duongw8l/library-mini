import { defineConfig } from 'vite'; // Hàm trợ giúp khai báo cấu hình Vite (có gợi ý kiểu)
import react from '@vitejs/plugin-react'; // Plugin cho phép Vite hiểu/biên dịch React (JSX, fast refresh)

export default defineConfig({ // Xuất cấu hình Vite
  plugins: [react()], // Bật plugin React
  server: { // Cấu hình server dev
    port: 5173, // Cổng chạy frontend khi dev
    proxy: { // Cấu hình chuyển tiếp request
      // Chuyển tiếp gọi API tới backend khi chạy dev (tránh CORS thủ công)
      '/api': 'http://localhost:4000', // Mọi request bắt đầu bằng /api -> backend ở cổng 4000
    }, // Kết thúc proxy
  }, // Kết thúc server
}); // Kết thúc defineConfig
