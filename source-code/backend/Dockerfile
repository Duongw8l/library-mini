FROM node:20-alpine
# ^ Ảnh nền: Node.js 20 bản Alpine (gọn nhẹ)

# Prisma trên Alpine cần OpenSSL + libc6-compat, nếu không sẽ lỗi
# "Could not parse schema engine response" khi khởi động.
RUN apk add --no-cache openssl libc6-compat
# ^ Cài thư viện hệ thống cần cho Prisma (không lưu cache gói để ảnh nhỏ hơn)

WORKDIR /app
# ^ Đặt thư mục làm việc trong container là /app

# Cài dependencies trước để tận dụng cache
COPY package*.json ./
# ^ Copy riêng package.json (và lock) trước để Docker cache bước cài đặt
RUN npm install --omit=dev
# ^ Cài dependencies, bỏ qua devDependencies (chỉ giữ gói chạy production)

# Copy mã nguồn + Prisma
COPY . .
# ^ Copy toàn bộ mã nguồn còn lại vào container
RUN npx prisma generate
# ^ Sinh Prisma Client từ schema (cần để truy vấn DB)

EXPOSE 4000
# ^ Khai báo container lắng nghe cổng 4000

CMD ["node", "src/server.js"]
# ^ Lệnh khởi chạy khi container start: chạy server backend
