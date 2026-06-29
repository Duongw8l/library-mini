# Nhật ký Prompt AI — Hệ thống Quản lý Thư viện Mini

> Minh chứng quá trình **AI Engineering** theo mô hình Spec-Driven Development.
> Công cụ sử dụng: **Claude (Anthropic)**, **GitHub Copilot**, **Speckit**.
> Ngày: 2026-06-29

Tài liệu này ghi lại các prompt tiêu biểu đã dùng ở từng bước SDD, kèm
ghi chú con người đã review/chỉnh sửa gì sau khi AI sinh kết quả.

---

## Bước 1 — Specification (Đặc tả)

### P-01. Sinh đặc tả từ đề bài
```
Tôi làm đề tài "Hệ thống Quản lý Thư viện Mini" theo Spec-Driven Development.
Người dùng gồm 3 vai trò: Sinh viên, Thủ thư, Quản trị viên.
Hãy viết spec.md gồm: bài toán, mục tiêu, phạm vi (in/out), actors,
chức năng theo vai trò, quy tắc nghiệp vụ, tiêu chí nghiệm thu.
```
**Review:** Bổ sung quy tắc BR-06 (đang quá hạn không được mượn thêm) và
BR-09 (không xóa sách còn bản đang mượn) mà AI chưa nêu.

### P-02. Chuẩn hóa yêu cầu chức năng có mã truy vết
```
Từ spec trên, hãy lập requirements.md: liệt kê FR (functional requirement)
có mã FR-xx, gán vai trò và mức ưu tiên MoSCoW; thêm NFR (phi chức năng)
về bảo mật, hiệu năng, nhất quán dữ liệu.
```
**Review:** Thêm NFR-05 (transaction cho mượn/trả) để đảm bảo nhất quán.

---

## Bước 2 — Planning & Architecture

### P-03. Đề xuất kiến trúc
```
Đề xuất kiến trúc cho hệ thống dùng React + Node.js/Express + PostgreSQL + Prisma + JWT.
Yêu cầu phân lớp controller/service/repository, vẽ sơ đồ tầng và ERD,
nêu các quyết định kiến trúc (ADR) kèm đánh đổi.
```
**Review:** Chốt ADR-3 (lưu sẵn `available_copies` thay vì COUNT động) để tối ưu truy vấn.

### P-04. Phân rã milestone & task
```
Lập plan.md (milestone M0..M8) và task.md (task gắn với FR và test case),
ưu tiên backend trước, theo thứ tự Auth → Books → Loans → Reports/Admin.
```

---

## Bước 3 — API Specification

### P-05. Thiết kế REST API
```
Viết api-spec.md: liệt kê toàn bộ endpoint REST cho 8 nhóm
(auth, books, categories, authors, loans, reports, users, settings),
kèm method, quyền theo role, ví dụ request/response JSON, mã lỗi.
```
**Review:** Thống nhất format response `{success, data, message}` và phân trang.

---

## Bước 4 — AI-assisted Development

### P-06. Sinh Prisma schema
```
Từ ERD, sinh schema.prisma cho PostgreSQL với các model:
User(role enum), Category, Author, Book(totalCopies/availableCopies),
Loan(status enum, dueDate, fineAmount, renewalCount), LoanRenewal, Setting.
Thêm index cho title, status, userId.
```
**Review:** AI tạo nhầm một quan hệ thừa trong model Loan → đã xóa thủ công;
chạy `prisma validate` để xác nhận hợp lệ.

### P-07. Sinh service mượn — trả theo quy tắc nghiệp vụ
```
Viết loans.service.js (Express + Prisma). Áp dụng:
- BR-01 hạn mức 5 cuốn, BR-05 hết bản thì chặn, BR-06 đang quá hạn thì chặn.
- approve: dùng prisma.$transaction giảm availableCopies, set dueDate +14 ngày.
- return: tăng availableCopies, tính phí phạt = ngày trễ × 5000 (BR-07).
- renew: tối đa 2 lần (BR-03), không gia hạn nếu đã quá hạn (BR-04).
Ném AppError(statusCode, message) khi vi phạm.
```
**Review:** AI ban đầu tính phí phạt sai khi trả đúng hạn (ra số âm) →
tách hàm thuần `overdueDays()` trả về max(0, diff) và viết unit test (BUG-01).
Bổ sung transaction cho `approve` để tránh `available_copies` âm khi tải đồng thời (BUG-02).

### P-08. Sinh middleware xác thực & phân quyền
```
Viết middleware authJwt (verify JWT, gắn req.user) và requireRole(...roles)
trả 401/403 đúng chuẩn. Dùng jsonwebtoken.
```
**Review:** Thêm try/catch quanh `jwt.verify` để token hết hạn trả 401 (BUG-04).

### P-09. Sinh giao diện React (có GitHub Copilot hỗ trợ inline)
```
Tạo trang Books.jsx: ô tìm kiếm theo từ khóa + lọc thể loại + checkbox "còn sách",
bảng kết quả có phân trang, nút xem chi tiết. Dùng axios service đã có.
```
**Review:** Copilot gợi ý hook `useEffect` gọi API; chỉnh lại để tránh gọi lặp khi mount.

---

## Bước 5 — Testing

### P-10. Sinh test
```
Viết unit test Jest cho logic nghiệp vụ thuần (overdueDays, computeFine,
canRenew, canBorrowMore) và integration test Supertest cho luồng
login → tìm sách → mượn → duyệt, kèm ca kiểm phân quyền 403.
```
**Review:** Tách `loan.rules.js` (hàm thuần, không import Prisma) để unit test
chạy được mà không cần CSDL. 13/13 unit test PASS.

---

## Bước 6 — Speckit (khởi tạo spec-driven)

Sử dụng Speckit để khởi tạo bộ tài liệu theo quy trình:
```
/specify  → sinh khung spec từ mô tả bài toán
/plan     → sinh kế hoạch kỹ thuật & lựa chọn công nghệ
/tasks    → phân rã task có thể thực thi
```
**Review:** Kết quả Speckit được dùng làm khung; nội dung chi tiết do nhóm
biên tập lại cho khớp đề tài 6 và các quy tắc nghiệp vụ riêng.

---

## Tổng kết sử dụng AI

| Bước | Công cụ chính | Mức đóng góp của AI | Người review |
|------|---------------|---------------------|--------------|
| Spec/Requirements | Claude | Sinh khung & gợi ý | Bổ sung BR-06, BR-09, NFR-05 |
| Architecture | Claude | Đề xuất + ADR | Chốt ADR-3 |
| Schema/Service | Claude + Copilot | Sinh phần lớn code | Sửa transaction, phí phạt |
| Frontend | Copilot | Tự hoàn thiện hàm/JSX | Sửa vòng lặp gọi API |
| Test | Claude | Sinh test case & code test | Tách module thuần để test |

**Nguyên tắc:** Mọi code AI sinh đều được con người **review + chạy test**
trước khi đưa vào sản phẩm. Chi tiết đánh giá xem `ai-review-report.pdf`.
