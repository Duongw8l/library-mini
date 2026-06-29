# Kiến trúc Hệ thống — Hệ thống Quản lý Thư viện Mini

> **Tài liệu:** `architecture.md` — Architecture (Kiến trúc & Thiết kế)
> **Phiên bản:** 1.0 — 2026-06-29

---

## 1. Tổng quan kiến trúc

Hệ thống theo kiến trúc **client–server 3 tầng (3-tier)**:

```
┌─────────────────────────────────────────────────────────────┐
│                        TRÌNH DUYỆT                           │
│   React SPA (Vite) — React Router, Axios, Context Auth       │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTPS / REST JSON + JWT
┌───────────────────────────▼─────────────────────────────────┐
│                      BACKEND (Node.js)                       │
│   Express REST API                                           │
│   ├─ Routes          (định tuyến)                            │
│   ├─ Middlewares     (auth JWT, RBAC, validate, error)       │
│   ├─ Controllers     (nhận request, trả response)            │
│   ├─ Services        (logic nghiệp vụ, transaction)          │
│   └─ Repositories    (Prisma Client truy cập CSDL)           │
└───────────────────────────┬─────────────────────────────────┘
                            │  Prisma ORM (SQL)
┌───────────────────────────▼─────────────────────────────────┐
│                    POSTGRESQL DATABASE                       │
│   users, books, categories, authors, book_copies,           │
│   loans, loan_renewals, fines, settings                     │
└─────────────────────────────────────────────────────────────┘
```

## 2. Lựa chọn công nghệ & lý do

| Tầng | Công nghệ | Lý do |
|------|-----------|-------|
| Frontend | React 18 + Vite | Nhẹ, HMR nhanh, hệ sinh thái lớn |
| UI | React Router, Axios, (CSS thuần / Tailwind) | Định tuyến SPA, gọi API |
| Backend | Node.js 20 + Express | Đơn giản, phù hợp REST API CRUD |
| ORM | Prisma | Type-safe, migration & seed dễ, sinh client tự động |
| Database | PostgreSQL 15 | Quan hệ chặt, hỗ trợ transaction, index full-text |
| Auth | JWT (jsonwebtoken) + bcrypt | Stateless, phổ biến, dễ phân quyền |
| Test | Jest + Supertest | Unit & integration test cho API |
| Đóng gói | Docker Compose | Chạy db + backend + frontend nhất quán |

## 3. Sơ đồ phân lớp Backend

```
Request
  │
  ▼
[Route]  ──▶  [Middleware: authJwt → requireRole → validate]
  │
  ▼
[Controller]  ── gọi ──▶  [Service]  ── gọi ──▶  [Prisma Repository]
  │                            │
  │                            └─ áp dụng Business Rules (BR-01..09)
  ▼
Response (JSON)
```

**Nguyên tắc:**
- Controller **không** chứa logic nghiệp vụ — chỉ điều phối.
- Service chứa toàn bộ quy tắc nghiệp vụ; thao tác đa bảng dùng `prisma.$transaction`.
- Mọi lỗi ném ra `AppError(statusCode, message)` và xử lý tập trung ở `errorHandler`.

## 4. Mô hình dữ liệu (ERD)

```
  ┌──────────┐        ┌────────────┐        ┌──────────┐
  │  users   │        │ categories │        │ authors  │
  └────┬─────┘        └─────┬──────┘        └────┬─────┘
       │ 1                  │ 1                  │ 1
       │                    │                    │
       │ N                  │ N                  │ N
  ┌────▼──────────────────────────────────────────────┐
  │                      books                         │
  │  id, title, isbn, description, category_id,        │
  │  author_id, publisher, total_copies,               │
  │  available_copies, published_year, cover_url       │
  └────┬───────────────────────────────────────────────┘
       │ 1
       │ N
  ┌────▼─────┐         ┌──────────────┐
  │  loans   │ 1 ─── N │ loan_renewals│
  │  id, book_id, user_id, status,    │
  │  borrowed_at, due_date,           │
  │  returned_at, fine_amount         │
  └────┬─────┘
       │ 1
       │ N
  ┌────▼─────┐
  │  fines   │  (ghi nhận phí phạt theo loan)
  └──────────┘

  ┌──────────┐
  │ settings │  (key/value: max_books, loan_days, fine_per_day...)
  └──────────┘
```

### 4.1. Trạng thái phiếu mượn (Loan status)

```
        ┌─────────┐  reject   ┌──────────┐
        │ PENDING ├──────────▶│ REJECTED │
        └────┬────┘           └──────────┘
             │ approve
             ▼
        ┌─────────┐  return   ┌──────────┐
        │ BORROWED├──────────▶│ RETURNED │
        └────┬────┘           └──────────┘
             │ quá due_date (job/khi truy vấn)
             ▼
        ┌─────────┐  return   ┌──────────┐
        │ OVERDUE ├──────────▶│ RETURNED │ (kèm fine)
        └─────────┘           └──────────┘
```

## 5. Bảo mật

- **Xác thực:** JWT ký bằng `JWT_SECRET`, payload `{ id, role }`, hết hạn 24h.
- **Phân quyền:** middleware `requireRole('LIBRARIAN','ADMIN')` chặn truy cập trái phép.
- **Mật khẩu:** bcrypt salt rounds = 10.
- **Validation:** kiểm tra đầu vào bằng `express-validator` / Zod ở tầng middleware.
- **CORS:** chỉ cho phép origin của frontend.
- **SQL Injection:** loại bỏ nhờ Prisma (tham số hóa truy vấn).

## 6. Cấu trúc thư mục mã nguồn

```
source-code/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # mô hình dữ liệu
│   │   └── seed.js              # dữ liệu mẫu
│   ├── src/
│   │   ├── config/              # env, prisma client
│   │   ├── middlewares/         # auth, rbac, validate, error
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── books/
│   │   │   ├── loans/
│   │   │   ├── users/
│   │   │   └── reports/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/                   # Jest + Supertest
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                 # axios client + service theo module
│   │   ├── components/
│   │   ├── context/             # AuthContext
│   │   ├── pages/               # theo vai trò
│   │   ├── routes/
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── database/
    ├── schema.sql               # DDL tham chiếu
    └── seed.sql                 # dữ liệu mẫu tham chiếu
```

## 7. Luồng triển khai (Deployment)

```
docker compose up
  ├─ service db        (postgres:15)        cổng 5432
  ├─ service backend   (node)               cổng 4000  → migrate + seed + start
  └─ service frontend  (node/nginx)         cổng 5173/80
```

## 8. Quyết định kiến trúc (ADR tóm tắt)

| # | Quyết định | Lý do | Đánh đổi |
|---|------------|-------|----------|
| ADR-1 | Dùng Prisma thay raw SQL | An toàn kiểu, migration dễ | Thêm 1 lớp trừu tượng |
| ADR-2 | JWT stateless thay session | Dễ scale, không cần store | Khó thu hồi token sớm |
| ADR-3 | `available_copies` lưu sẵn trên `books` | Truy vấn nhanh, tránh COUNT | Phải cập nhật trong transaction |
| ADR-4 | Monorepo (frontend+backend cùng repo) | Đồng bộ phiên bản dễ | Repo lớn hơn |
| ADR-5 | OVERDUE tính khi truy vấn + job nhẹ | Không cần cron phức tạp | Cần kiểm tra lúc đọc |
