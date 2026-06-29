import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Chuyển tiếp gọi API tới backend khi chạy dev (tránh CORS thủ công)
      '/api': 'http://localhost:4000',
    },
  },
});
