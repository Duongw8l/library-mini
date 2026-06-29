# Đặc tả API — Hệ thống Quản lý Thư viện Mini

> **Tài liệu:** `api-spec.md` — API Specification (REST)
> **Base URL:** `http://localhost:4000/api`
> **Định dạng:** JSON (UTF-8). **Auth:** `Authorization: Bearer <JWT>`
> **Phiên bản:** 1.0 — 2026-06-29

---

## 1. Quy ước chung

### 1.1. Định dạng response thành công
```json
{ "success": true, "data": { ... }, "message": "..." }
```
Với danh sách có phân trang:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

### 1.2. Định dạng lỗi
```json
{ "success": false, "message": "Mô tả lỗi", "errors": [ ... ] }
```

### 1.3. Mã trạng thái HTTP
| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Dữ liệu không hợp lệ |
| 401 | Chưa đăng nhập / token sai |
| 403 | Không đủ quyền |
| 404 | Không tìm thấy |
| 409 | Xung đột (vi phạm nghiệp vụ) |
| 500 | Lỗi máy chủ |

### 1.4. Vai trò
`STUDENT` · `LIBRARIAN` · `ADMIN`

---

## 2. Auth — `/api/auth`

### POST `/auth/register`
Đăng ký tài khoản (role mặc định STUDENT). — *Public*
```json
// Request
{ "fullName": "Nguyễn Văn A", "email": "a@sv.edu.vn", "password": "Pass@123" }
// 201
{ "success": true, "data": { "id": 1, "email": "a@sv.edu.vn", "role": "STUDENT" } }
```

### POST `/auth/login`
```json
// Request
{ "email": "a@sv.edu.vn", "password": "Pass@123" }
// 200
{ "success": true, "data": { "token": "<JWT>", "user": { "id":1, "fullName":"...", "role":"STUDENT" } } }
```

### GET `/auth/me` — *Authenticated*
Trả về thông tin người dùng hiện tại.

### PUT `/auth/change-password` — *Authenticated*
```json
{ "oldPassword": "...", "newPassword": "..." }
```

---

## 3. Books — `/api/books`

### GET `/books`  — *Public*
Tìm kiếm & liệt kê sách (phân trang).
| Query | Kiểu | Mô tả |
|-------|------|-------|
| `q` | string | từ khóa (tiêu đề/tác giả/ISBN) |
| `categoryId` | int | lọc theo thể loại |
| `available` | bool | chỉ sách còn bản |
| `page`, `limit` | int | phân trang |
| `sort` | string | `title` \| `-createdAt` ... |

```json
// 200
{
  "success": true,
  "data": [
    { "id": 1, "title": "Giải tích 1", "isbn": "978-...", "author": "Nguyễn B",
      "category": "Toán học", "totalCopies": 5, "availableCopies": 3 }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

### GET `/books/:id` — *Public*
Chi tiết một đầu sách.

### POST `/books` — *LIBRARIAN, ADMIN*
```json
{
  "title": "Cấu trúc dữ liệu", "isbn": "978-604-...", "authorId": 2,
  "categoryId": 1, "publisher": "NXB Giáo dục", "publishedYear": 2022,
  "description": "...", "totalCopies": 4
}
```

### PUT `/books/:id` — *LIBRARIAN, ADMIN*
Cập nhật thông tin đầu sách.

### PATCH `/books/:id/copies` — *LIBRARIAN*
Cập nhật tổng số bản sao. `{ "totalCopies": 6 }` (FR-15).

### DELETE `/books/:id` — *LIBRARIAN, ADMIN*
Xóa đầu sách. **409** nếu còn bản đang mượn (BR-09).

---

## 4. Categories & Authors — `/api/categories`, `/api/authors`

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/categories` | Public | Danh sách thể loại |
| POST | `/categories` | LIBRARIAN, ADMIN | Thêm thể loại |
| PUT | `/categories/:id` | LIBRARIAN, ADMIN | Sửa |
| DELETE | `/categories/:id` | ADMIN | Xóa (chặn nếu còn sách) |
| GET | `/authors` | Public | Danh sách tác giả |
| POST | `/authors` | LIBRARIAN, ADMIN | Thêm tác giả |

---

## 5. Loans (Mượn — Trả) — `/api/loans`

### POST `/loans` — *STUDENT*
Gửi yêu cầu mượn. Áp dụng BR-01, BR-05, BR-06.
```json
// Request
{ "bookId": 1 }
// 201
{ "success": true, "data": { "id": 10, "status": "PENDING", "bookId": 1 } }
// 409 nếu: hết bản | vượt hạn mức | đang có sách quá hạn
```

### GET `/loans/my` — *STUDENT*
Lịch sử mượn — trả của bản thân (FR-26). Hỗ trợ lọc `status`.

### GET `/loans` — *LIBRARIAN, ADMIN*
Tất cả phiếu mượn. Lọc `status=PENDING|BORROWED|OVERDUE|RETURNED|REJECTED`.

### GET `/loans/overdue` — *LIBRARIAN, ADMIN*
Danh sách phiếu quá hạn kèm phí phạt dự kiến (FR-28).

### PATCH `/loans/:id/approve` — *LIBRARIAN*
Duyệt yêu cầu. `available_copies -= 1`, set `due_date` (+14 ngày). (FR-22, BR-08)

### PATCH `/loans/:id/reject` — *LIBRARIAN*
```json
{ "reason": "Sách đang bảo trì" }
```

### PATCH `/loans/:id/return` — *LIBRARIAN*
Xác nhận trả. `available_copies += 1`, tính `fine_amount` nếu quá hạn. (FR-24, BR-07)

### PATCH `/loans/:id/renew` — *STUDENT*
Gia hạn (FR-25). Áp dụng BR-03, BR-04. **409** nếu vượt số lần / đã quá hạn.

---

## 6. Reports — `/api/reports`

### GET `/reports/dashboard` — *LIBRARIAN, ADMIN*
```json
{
  "success": true,
  "data": {
    "totalBooks": 120, "totalCopies": 480, "borrowed": 35,
    "overdue": 4, "pending": 6, "totalUsers": 210
  }
}
```

### GET `/reports/top-books` — *LIBRARIAN, ADMIN*
Top sách mượn nhiều. Query `limit`, `from`, `to` (FR-31).

### GET `/reports/loans-by-period` — *LIBRARIAN, ADMIN*
Lượt mượn theo thời gian. Query `from`, `to`, `groupBy=day|month` (FR-32).

### GET `/reports/borrow-return-7days` — *LIBRARIAN, ADMIN*
Số lượt mượn & trả theo 7 ngày gần nhất (cho biểu đồ cột chồng ở Dashboard tổng quan).
```json
{ "success": true, "data": [ { "date": "2026-06-23", "label": "Tue", "borrowed": 3, "returned": 4 } ] }
```

### GET `/reports/loans-by-status` — *LIBRARIAN, ADMIN*
Phân bố số phiếu mượn theo trạng thái (cho biểu đồ tròn). OVERDUE được suy ra từ phiếu BORROWED quá hạn.
```json
{ "success": true, "data": [ { "status": "BORROWED", "count": 12 }, { "status": "OVERDUE", "count": 3 } ] }
```

### GET `/reports/books-by-category` — *LIBRARIAN, ADMIN*
Số đầu sách theo thể loại (cho biểu đồ cột).
```json
{ "success": true, "data": [ { "category": "Lập trình", "count": 3 }, { "category": "Toán học", "count": 2 } ] }
```

### GET `/reports/export` — *ADMIN*
Xuất CSV. Query `type=loans|books|fines` → trả file `text/csv` (FR-33).

---

## 7. Users (Quản trị) — `/api/users`

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/users` | LIBRARIAN, ADMIN | Liệt kê / tìm kiếm độc giả (Thủ thư chỉ xem) (FR-40) |
| POST | `/users` | ADMIN | Tạo tài khoản (gán role) (FR-41) |
| PUT | `/users/:id` | ADMIN | Cập nhật thông tin |
| PATCH | `/users/:id/role` | ADMIN | Đổi vai trò (FR-42) |
| PATCH | `/users/:id/status` | ADMIN | Khóa / mở khóa `{ "active": false }` |
| DELETE | `/users/:id` | ADMIN | Xóa tài khoản (soft delete) |

---

## 8. Settings — `/api/settings`

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/settings` | LIBRARIAN, ADMIN | Lấy cấu hình hệ thống |
| PUT | `/settings` | ADMIN | Cập nhật (max_books, loan_days, fine_per_day...) (FR-43) |

---

## 9. Bảng tổng hợp Endpoint ↔ Yêu cầu

| Endpoint | Yêu cầu |
|----------|---------|
| POST /auth/register, /login | FR-01, FR-02 |
| GET /books, /books/:id | FR-10, FR-11 |
| POST/PUT/DELETE /books | FR-12..14 |
| PATCH /books/:id/copies | FR-15 |
| /categories, /authors | FR-16, FR-17 |
| POST /loans | FR-20 |
| GET /loans, /loans/my, /loans/overdue | FR-21, FR-26, FR-28 |
| PATCH /loans/:id/{approve,reject,return,renew} | FR-22..25 |
| /reports/* | FR-30..33 |
| /users/* | FR-40..42 |
| /settings | FR-43 |
