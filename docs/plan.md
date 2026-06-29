# Kế hoạch Phát triển — Hệ thống Quản lý Thư viện Mini

> **Tài liệu:** `plan.md` — Planning (Kế hoạch & Lộ trình)
> **Phương pháp:** Spec-Driven Development (Problem → Spec → Plan → Task → AI-assisted Dev → Test → Eval → Docs)
> **Phiên bản:** 1.0 — 2026-06-29

---

## 1. Quy trình SDD áp dụng

```
Problem ─▶ Specification ─▶ Planning ─▶ Task Breakdown
   │            │              │              │
 spec.md   requirements.md  plan.md        task.md
                                              │
                                              ▼
                         AI-assisted Development
                    (Claude + GitHub Copilot + Speckit)
                                              │
                                              ▼
                    Testing ─▶ Evaluation ─▶ Documentation
                  test-plan.md            retrospective.md
```

Mỗi vòng lặp: **viết spec → AI sinh khung code → review → kiểm thử → tinh chỉnh spec**.

## 2. Kiến trúc & công nghệ (chốt)

- Frontend: React + Vite · Backend: Node.js + Express · DB: PostgreSQL + Prisma · Auth: JWT.
- Chi tiết: xem `architecture.md`.

## 3. Phân rã giai đoạn (Milestones)

| GĐ | Tên | Đầu ra chính | Phụ thuộc |
|----|-----|--------------|-----------|
| M0 | Khởi tạo & Tài liệu SDD | Bộ `docs/` đầy đủ | — |
| M1 | Nền tảng Backend | Prisma schema, migration, seed, app skeleton | M0 |
| M2 | Auth & Phân quyền | register/login JWT, middleware RBAC | M1 |
| M3 | Module Sách & Danh mục | CRUD books, categories, authors, tìm kiếm | M2 |
| M4 | Module Mượn — Trả | loan request/approve/return/renew/overdue | M3 |
| M5 | Module Báo cáo & Quản trị | dashboard, thống kê, users, settings | M4 |
| M6 | Frontend | UI theo 3 vai trò, gọi API | M2–M5 |
| M7 | Kiểm thử & Đánh giá | test cases, test report, bug report | M4–M6 |
| M8 | Hoàn thiện & Minh chứng AI | retrospective, ai-artifacts, docker | M7 |

## 4. Thứ tự ưu tiên triển khai

1. **Backend trước, frontend sau** — vì frontend phụ thuộc API.
2. Trong backend: **Auth → Books → Loans → Reports/Admin** (theo độ phụ thuộc nghiệp vụ).
3. Viết test song song mỗi khi hoàn thành 1 module nghiệp vụ.

## 5. Vai trò của AI trong quy trình (AI Engineering)

| Công cụ | Sử dụng cho | Minh chứng |
|---------|-------------|------------|
| Claude / ChatGPT | Sinh spec, schema Prisma, service logic, sinh test | `ai-artifacts/prompts.md` |
| GitHub Copilot | Tự hoàn thiện hàm, controller, component React | inline trong code |
| Speckit | Khởi tạo cấu trúc spec-driven (`/specify`, `/plan`, `/tasks`) | `ai-artifacts/` |

**Nguyên tắc kiểm soát chất lượng AI:** mọi code do AI sinh đều được con người
review (`ai-review-report.pdf`) và phải pass test trước khi hợp nhất.

## 6. Ước lượng & Lịch (gợi ý 4 tuần)

| Tuần | Công việc | Milestone |
|------|-----------|-----------|
| 1 | Tài liệu SDD + khởi tạo backend + Auth | M0, M1, M2 |
| 2 | Module Sách + Mượn—Trả + test | M3, M4 |
| 3 | Báo cáo + Quản trị + Frontend | M5, M6 |
| 4 | Kiểm thử toàn diện + tài liệu + đóng gói | M7, M8 |

## 7. Quản lý rủi ro

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|--------|-----------|-----------|
| Sai lệch số `available_copies` | Cao | Dùng transaction, test nghiệp vụ kỹ |
| Code AI sinh thiếu validate | TB | Review + test biên + express-validator |
| Phạm vi phình to | TB | Bám sát Must-have trong `requirements.md` |
| Lệch múi giờ tính quá hạn | TB | Chuẩn hóa UTC, test mốc thời gian |
| Môi trường Windows lệch | Thấp | Docker Compose chuẩn hóa |

## 8. Tiêu chí hoàn thành kế hoạch (Exit Criteria)

- Tất cả Milestone M0–M8 đạt đầu ra.
- ≥ 90% test case Must-have pass.
- Hệ thống chạy được end-to-end (đăng nhập 3 vai trò → mượn → duyệt → trả).
- Bộ tài liệu & minh chứng AI đầy đủ theo yêu cầu đề bài.
