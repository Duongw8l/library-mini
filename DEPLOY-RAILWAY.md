# Triển khai lên Railway

Hệ thống Quản lý Thư viện Mini được đóng gói để chạy trên Railway dưới dạng
**1 web service** (backend Express phục vụ luôn frontend đã build) **+ 1 PostgreSQL**.
Cách này đơn giản nhất: 1 domain duy nhất, không cần cấu hình CORS hay proxy giữa các service.

```
┌─────────────────────────────┐      ┌──────────────────┐
│  Web service (Dockerfile)   │ ───▶ │  PostgreSQL      │
│  Express API + frontend tĩnh│      │  (Railway plugin)│
│  Dockerfile.railway         │      └──────────────────┘
└─────────────────────────────┘
        ▲  https://<app>.up.railway.app
```

> Cấu hình build nằm ở `source-code/railway.json` (trỏ tới `source-code/Dockerfile.railway`).
> **Root directory** của service trên Railway phải đặt là `source-code`.

---

## Biến môi trường cần đặt (trên service ứng dụng)

| Biến | Giá trị | Ghi chú |
|------|---------|---------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Tham chiếu tới plugin PostgreSQL |
| `JWT_SECRET` | một chuỗi ngẫu nhiên dài | Bắt buộc đổi cho production |
| `NODE_ENV` | `production` | |
| `PORT` | *(Railway tự cấp)* | server.js đã đọc `process.env.PORT` |

---

## Cách A — Deploy từ GitHub (khuyến nghị)

1. **Đưa code lên GitHub** (chạy ở thư mục gốc `D:\chuyendean`):
   ```bash
   git init
   git add .
   git commit -m "Library Mini - SDD project"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```

2. Vào https://railway.app → **New Project** → **Deploy from GitHub repo** → chọn repo vừa đẩy.

3. Thêm CSDL: trong project bấm **New** → **Database** → **Add PostgreSQL**.

4. Mở **service ứng dụng** (service build từ repo):
   - **Settings → Source → Root Directory** = `source-code`
     (để Railway tìm thấy `railway.json` + `Dockerfile.railway`).
   - **Variables** → thêm các biến ở bảng trên
     (`DATABASE_URL` = `${{Postgres.DATABASE_URL}}`, `JWT_SECRET`, `NODE_ENV`).

5. **Settings → Networking → Generate Domain** để lấy URL công khai.

6. Railway tự build & deploy. Khi xong, mở domain → đăng nhập bằng tài khoản mẫu.

---

## Cách B — Dùng Railway CLI

```bash
npm i -g @railway/cli
railway login                      # mở trình duyệt xác thực

cd D:\chuyendean\source-code
railway init                       # tạo project mới
railway add --database postgres    # thêm PostgreSQL

# Đặt biến môi trường
railway variables --set "JWT_SECRET=doi-thanh-chuoi-bi-mat-ngau-nhien" \
                   --set "NODE_ENV=production" \
                   --set "DATABASE_URL=\${{Postgres.DATABASE_URL}}"

railway up                         # build & deploy theo Dockerfile.railway
railway domain                     # tạo & xem domain công khai
```

---

## Sau khi deploy

- Mở `https://<app>.up.railway.app`.
- Khi container khởi động sẽ tự: `prisma db push` (tạo bảng) → seed dữ liệu mẫu → chạy API.
- Tài khoản mẫu (mật khẩu `Pass@123`): `admin@lib.edu.vn`, `librarian@lib.edu.vn`, `student@lib.edu.vn`.
- Healthcheck: `https://<app>.up.railway.app/api/health`.

### Ghi chú
- **Seed chạy mỗi lần khởi động** nhưng idempotent (upsert; dữ liệu phiếu mượn mẫu chỉ tạo khi DB chưa có phiếu nào). Muốn tắt seed cho production: sửa `CMD` trong `Dockerfile.railway`, bỏ phần `node prisma/seed.js`.
- Nếu đổi sang dùng migration thật thay cho `db push`: tạo thư mục `prisma/migrations` (`npx prisma migrate dev`) rồi đổi `CMD` thành `npx prisma migrate deploy`.
- Gói image dùng `node:20-alpine` + OpenSSL; Prisma binary target `linux-musl-openssl-3.0.x` đã khai báo trong `schema.prisma`.

## Đã kiểm chứng cục bộ
Image `Dockerfile.railway` đã được build & chạy thử (kết nối PostgreSQL), xác nhận:
phục vụ frontend tại `/`, API tại `/api/*`, SPA deep-link, và static assets — tất cả trên **một cổng duy nhất**.
