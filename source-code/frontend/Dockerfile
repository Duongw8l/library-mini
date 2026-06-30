# --- Build stage ---
FROM node:20-alpine AS build
# ^ Giai đoạn 1: dùng Node 20 Alpine để build, đặt tên stage là "build"
WORKDIR /app
# ^ Thư mục làm việc /app
COPY package*.json ./
# ^ Copy package.json trước để tận dụng cache cài đặt
RUN npm install
# ^ Cài tất cả dependencies (gồm cả dev, cần cho Vite build)
COPY . .
# ^ Copy toàn bộ mã nguồn frontend
RUN npm run build
# ^ Build ra thư mục dist/ (HTML/CSS/JS tĩnh đã tối ưu)

# --- Serve stage ---
FROM nginx:alpine
# ^ Giai đoạn 2: dùng máy chủ web Nginx (Alpine) để phục vụ file tĩnh
COPY --from=build /app/dist /usr/share/nginx/html
# ^ Lấy bản build từ stage trước, đặt vào thư mục web gốc của Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# ^ Thay cấu hình Nginx mặc định bằng nginx.conf của dự án (có proxy /api và SPA fallback)
EXPOSE 80
# ^ Container lắng nghe cổng 80
CMD ["nginx", "-g", "daemon off;"]
# ^ Chạy Nginx ở chế độ foreground (giữ container sống)
