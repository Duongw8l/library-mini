# Hệ thống Quản lý Thư viện Mini

> Đề tài 6 — phát triển theo mô hình **Spec-Driven Development (AI Engineering)**:
> Problem → Specification → Planning → Task Breakdown → AI-assisted Development →
> Testing → Evaluation → Documentation.

Hệ thống quản lý thư viện trực tuyến giúp số hóa hoạt động quản lý sách và quy trình
mượn — trả, với 3 vai trò: **Sinh viên**, **Thủ thư**, **Quản trị viên**.

## 🧱 Công nghệ

| Tầng | Công nghệ |
|------|-----------|
| Frontend | React 18 + Vite + React Router |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt, phân quyền 3 vai trò |
| Test | Jest + Supertest |
| Đóng gói | Docker Compose |

## 📂 Cấu trúc bàn giao

```
.
├── docs/                # Tài liệu SDD (spec, requirements, plan, task, architecture, api-spec, test-plan, retrospective)
├── source-code/
│   ├── frontend/        # React app
│   ├── backend/         # Express API + Prisma
│   ├── database/        # schema.sql, seed.sql (tham chiếu)
│   └── docker-compose.yml
├── testing/             # test-cases.xlsx, test-report.pdf, bug-report.xlsx
└── ai-artifacts/        # prompts.md, ai-generated-code/, ai-review-report.pdf
```

## 🚀 Cách chạy

### Cách 1 — Docker Compose (khuyến nghị)
```bash
cd source-code
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Backend tự động migrate + seed dữ liệu mẫu khi khởi động.

### Cách 2 — Chạy thủ công

**Yêu cầu:** Node.js ≥ 20, PostgreSQL ≥ 15 đang chạy.

```bash
# 1) Backend
cd source-code/backend
cp .env.example .env        # chỉnh DATABASE_URL cho đúng
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev                 # API tại http://localhost:4000

# 2) Frontend (terminal khác)
cd source-code/frontend
npm install
npm run dev                 # UI tại http://localhost:5173
```

## 👤 Tài khoản mẫu (mật khẩu: `Pass@123`)

| Vai trò | Email |
|---------|-------|
| Quản trị viên | `admin@lib.edu.vn` |
| Thủ thư | `librarian@lib.edu.vn` |
| Sinh viên | `student@lib.edu.vn` |

## ✅ Kiểm thử

```bash
cd source-code/backend
npm test                    # unit test logic nghiệp vụ (không cần CSDL)

# Test tích hợp API (cần CSDL test đã migrate + seed):
#   set DATABASE_URL=postgresql://.../library_test
#   set RUN_DB_TESTS=1 && npm test
```

Kết quả kiểm thử tổng hợp: `testing/test-report.pdf` · Lỗi: `testing/bug-report.xlsx`.

## 🤖 Minh chứng AI Engineering

- `ai-artifacts/prompts.md` — nhật ký prompt theo từng bước SDD.
- `ai-artifacts/ai-generated-code/` — mẫu code AI sinh (kèm ghi chú review).
- `ai-artifacts/ai-review-report.pdf` — báo cáo đánh giá code do AI sinh.

## 🔑 Chức năng theo vai trò

- **Sinh viên:** tìm kiếm sách, xem chi tiết, đăng ký mượn, gia hạn, xem lịch sử.
- **Thủ thư:** quản lý đầu sách, duyệt/từ chối mượn, xác nhận trả, xử lý quá hạn, cập nhật số bản.
- **Quản trị viên:** quản lý tài khoản & phân quyền, danh mục, xem thống kê, xuất báo cáo CSV.

## 📐 Quy tắc nghiệp vụ chính

Mượn tối đa 5 cuốn · hạn 14 ngày · gia hạn tối đa 2 lần (7 ngày/lần) ·
phí phạt 5.000đ/ngày trễ · không mượn khi đang có sách quá hạn ·
không xóa sách còn bản đang mượn. (Chi tiết: `docs/spec.md` §6)
