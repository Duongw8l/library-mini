# Phân rã Công việc — Hệ thống Quản lý Thư viện Mini

> **Tài liệu:** `task.md` — Task Breakdown
> **Quy ước trạng thái:** ☐ chưa làm · ◐ đang làm · ☑ xong
> **Phiên bản:** 1.0 — 2026-06-29
>
> **TRẠNG THÁI:** ✅ Tất cả milestone M0–M8 đã hoàn thành (xem `retrospective.md`).

---

## M0 — Khởi tạo & Tài liệu SDD
- [x] T0.1 — Tạo cấu trúc thư mục `docs/ source-code/ testing/ ai-artifacts/`
- [x] T0.2 — Viết `spec.md`
- [x] T0.3 — Viết `requirements.md`
- [x] T0.4 — Viết `architecture.md`
- [x] T0.5 — Viết `api-spec.md`
- [x] T0.6 — Viết `plan.md`
- [x] T0.7 — Viết `task.md`
- [x] T0.8 — Viết `test-plan.md`
- [x] T0.9 — Viết `retrospective.md`

## M1 — Nền tảng Backend  (FR-: hạ tầng)
- [x] T1.1 — Khởi tạo project Node + Express, cấu trúc module
- [x] T1.2 — Thiết kế `schema.prisma` (users, books, categories, authors, loans, ...)
- [x] T1.3 — Tạo migration + Prisma Client
- [x] T1.4 — Viết `seed.js` (admin, thủ thư, sinh viên, sách mẫu)
- [x] T1.5 — `app.js` + middleware lỗi tập trung + healthcheck

## M2 — Auth & Phân quyền  (FR-01..04, NFR-02..04)
- [x] T2.1 — `POST /auth/register` (bcrypt)
- [x] T2.2 — `POST /auth/login` (JWT)
- [x] T2.3 — Middleware `authJwt` + `requireRole`
- [x] T2.4 — `GET /auth/me`, `PUT /auth/change-password`

## M3 — Sách & Danh mục  (FR-10..17)
- [x] T3.1 — `GET /books` tìm kiếm + phân trang + lọc
- [x] T3.2 — `GET /books/:id`
- [x] T3.3 — `POST /books`, `PUT /books/:id`, `DELETE /books/:id` (BR-09)
- [x] T3.4 — `PATCH /books/:id/copies` (FR-15)
- [x] T3.5 — CRUD `categories`, `authors`

## M4 — Mượn — Trả  (FR-20..28, BR-01..08)
- [x] T4.1 — `POST /loans` (BR-01, BR-05, BR-06)
- [x] T4.2 — `GET /loans`, `GET /loans/my`, `GET /loans/overdue`
- [x] T4.3 — `PATCH /loans/:id/approve` (transaction, BR-08)
- [x] T4.4 — `PATCH /loans/:id/reject`
- [x] T4.5 — `PATCH /loans/:id/return` (tính phí phạt BR-07)
- [x] T4.6 — `PATCH /loans/:id/renew` (BR-03, BR-04)
- [x] T4.7 — Logic tự đánh dấu OVERDUE khi truy vấn (FR-27)

## M5 — Báo cáo & Quản trị  (FR-30..43)
- [x] T5.1 — `GET /reports/dashboard`
- [x] T5.2 — `GET /reports/top-books`, `/reports/loans-by-period`
- [x] T5.3 — `GET /reports/export` (CSV)
- [x] T5.4 — CRUD `users` + đổi role + khóa/mở
- [x] T5.5 — `GET/PUT /settings`

## M6 — Frontend  (FR-: UI)
- [x] T6.1 — Khởi tạo Vite + Router + AuthContext + Axios client
- [x] T6.2 — Trang Đăng nhập / Đăng ký
- [x] T6.3 — Sinh viên: tìm kiếm sách, chi tiết, mượn, gia hạn, lịch sử
- [x] T6.4 — Thủ thư: quản lý sách, duyệt mượn, trả, quá hạn
- [x] T6.5 — Admin: dashboard, quản lý người dùng, danh mục, báo cáo
- [x] T6.6 — Layout + điều hướng theo vai trò + bảo vệ route

## M7 — Kiểm thử & Đánh giá
- [x] T7.1 — Viết unit/integration test (Jest + Supertest) cho Auth, Books, Loans
- [x] T7.2 — Lập `test-cases` (testing/test-cases.csv|xlsx)
- [x] T7.3 — Chạy test, tổng hợp `test-report`
- [x] T7.4 — Ghi nhận lỗi `bug-report`

## M8 — Hoàn thiện & Minh chứng AI
- [x] T8.1 — `prompts.md` (lịch sử prompt AI)
- [x] T8.2 — `ai-generated-code/` (mẫu code AI sinh)
- [x] T8.3 — `ai-review-report` (đánh giá code AI)
- [x] T8.4 — `docker-compose.yml` + README chạy được
- [x] T8.5 — `retrospective.md`

---

## Ma trận truy vết Task ↔ Yêu cầu

| Task | Yêu cầu | Test case |
|------|---------|-----------|
| T2.1, T2.2 | FR-01, FR-02 | TC-AUTH-* |
| T3.1, T3.2 | FR-10, FR-11 | TC-BOOK-* |
| T3.3, T3.4 | FR-12..15 | TC-BOOK-* |
| T4.1 | FR-20, BR-01/05/06 | TC-LOAN-01..05 |
| T4.3, T4.5 | FR-22, FR-24, BR-07/08 | TC-LOAN-06..10 |
| T4.6 | FR-25, BR-03/04 | TC-LOAN-11..13 |
| T5.1..5.3 | FR-30..33 | TC-RPT-* |
| T5.4 | FR-40..42 | TC-USER-* |
