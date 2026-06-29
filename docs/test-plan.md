# Kế hoạch Kiểm thử — Hệ thống Quản lý Thư viện Mini

> **Tài liệu:** `test-plan.md` — Test Plan
> **Phiên bản:** 1.0 — 2026-06-29

---

## 1. Mục tiêu kiểm thử

- Xác minh các yêu cầu chức năng (FR) và quy tắc nghiệp vụ (BR) hoạt động đúng.
- Đảm bảo tính nhất quán dữ liệu mượn — trả (số `available_copies`).
- Đảm bảo phân quyền: vai trò không đủ quyền bị chặn (401/403).

## 2. Phạm vi

| Trong phạm vi | Ngoài phạm vi |
|---------------|---------------|
| API backend (unit + integration) | Kiểm thử tải lớn (load test) |
| Logic nghiệp vụ mượn — trả — gia hạn | Kiểm thử bảo mật chuyên sâu (pentest) |
| Phân quyền theo vai trò | Kiểm thử tương thích đa trình duyệt sâu |
| Kiểm thử thủ công luồng UI chính | |

## 3. Chiến lược & cấp độ kiểm thử

| Cấp độ | Công cụ | Đối tượng |
|--------|---------|-----------|
| Unit test | Jest | Service nghiệp vụ (tính phí phạt, kiểm hạn mức) |
| Integration test | Jest + Supertest | Endpoint API + DB (test DB riêng) |
| Manual / UAT | Thủ công theo kịch bản | Luồng end-to-end trên UI |

**Môi trường test:** PostgreSQL test DB riêng (`library_test`), seed cố định trước mỗi suite.

## 4. Tiêu chí vào / ra

- **Vào:** module đã code xong, build pass, có seed test.
- **Ra (pass):** ≥ 90% test case Must-have PASS; không còn bug mức Critical/High mở.

## 5. Danh sách Test Case (tổng hợp)

> Bản đầy đủ ở `testing/test-cases.csv`. Dưới đây là các ca tiêu biểu.

### 5.1. Xác thực — TC-AUTH
| ID | Mô tả | Tiền điều kiện | Bước | Kết quả mong đợi |
|----|-------|----------------|------|-------------------|
| TC-AUTH-01 | Đăng ký thành công | email chưa tồn tại | POST /auth/register | 201, tạo user role STUDENT |
| TC-AUTH-02 | Đăng ký trùng email | email đã tồn tại | POST /auth/register | 409 |
| TC-AUTH-03 | Đăng nhập đúng | user tồn tại | POST /auth/login | 200, trả JWT |
| TC-AUTH-04 | Đăng nhập sai mật khẩu | user tồn tại | POST /auth/login | 401 |
| TC-AUTH-05 | Truy cập /auth/me không token | — | GET /auth/me | 401 |

### 5.2. Sách — TC-BOOK
| ID | Mô tả | Bước | Kết quả mong đợi |
|----|-------|------|-------------------|
| TC-BOOK-01 | Tìm kiếm theo từ khóa | GET /books?q=giai tich | 200, danh sách khớp |
| TC-BOOK-02 | Xem chi tiết sách tồn tại | GET /books/1 | 200, có availableCopies |
| TC-BOOK-03 | Xem sách không tồn tại | GET /books/9999 | 404 |
| TC-BOOK-04 | Thủ thư thêm sách | POST /books (role LIBRARIAN) | 201 |
| TC-BOOK-05 | Sinh viên thêm sách (bị chặn) | POST /books (role STUDENT) | 403 |
| TC-BOOK-06 | Xóa sách còn bản đang mượn | DELETE /books/:id | 409 (BR-09) |
| TC-BOOK-07 | Cập nhật số bản sao | PATCH /books/:id/copies | 200, availableCopies cập nhật đúng |

### 5.3. Mượn — Trả — TC-LOAN
| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| TC-LOAN-01 | Mượn khi còn bản | 201, status PENDING |
| TC-LOAN-02 | Mượn khi hết bản (available=0) | 409 (BR-05) |
| TC-LOAN-03 | Mượn vượt hạn mức 5 cuốn | 409 (BR-01) |
| TC-LOAN-04 | Mượn khi đang có sách quá hạn | 409 (BR-06) |
| TC-LOAN-05 | Sinh viên xem lịch sử của mình | 200, chỉ phiếu của mình |
| TC-LOAN-06 | Thủ thư duyệt mượn | 200, available-=1, due_date=+14d (BR-08) |
| TC-LOAN-07 | Thủ thư từ chối mượn | 200, status REJECTED, available không đổi |
| TC-LOAN-08 | Trả sách đúng hạn | 200, available+=1, fine=0 |
| TC-LOAN-09 | Trả sách quá hạn | 200, fine = ngày trễ × 5000 (BR-07) |
| TC-LOAN-10 | Sinh viên duyệt mượn (bị chặn) | 403 |
| TC-LOAN-11 | Gia hạn hợp lệ | 200, due_date +7d, renewals+1 |
| TC-LOAN-12 | Gia hạn quá 2 lần | 409 (BR-03) |
| TC-LOAN-13 | Gia hạn khi đã quá hạn | 409 (BR-04) |

### 5.4. Báo cáo — TC-RPT
| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| TC-RPT-01 | Dashboard số liệu tổng | 200, các chỉ số ≥ 0 |
| TC-RPT-02 | Top sách mượn nhiều | 200, sắp xếp giảm dần |
| TC-RPT-03 | Xuất CSV (ADMIN) | 200, content-type text/csv |
| TC-RPT-04 | Sinh viên xem dashboard (chặn) | 403 |

### 5.5. Quản trị — TC-USER
| ID | Mô tả | Kết quả mong đợi |
|----|-------|-------------------|
| TC-USER-01 | Admin liệt kê người dùng | 200 |
| TC-USER-02 | Admin đổi role thành LIBRARIAN | 200 |
| TC-USER-03 | Admin khóa tài khoản | 200, user.active=false |
| TC-USER-04 | Thủ thư truy cập /users (chặn) | 403 |

## 6. Dữ liệu kiểm thử

- Tài khoản seed: `admin@lib.edu.vn`, `librarian@lib.edu.vn`, `student@lib.edu.vn` (mật khẩu: `Pass@123`).
- Sách mẫu: ≥ 10 đầu sách thuộc ≥ 3 thể loại, số bản 1–5.

## 7. Báo cáo & theo dõi lỗi

- Kết quả tổng hợp → `testing/test-report` (md/pdf).
- Lỗi ghi nhận → `testing/bug-report.csv` với mức độ: Critical / High / Medium / Low.

## 8. Tiêu chí đánh giá (Evaluation)

| Chỉ số | Mục tiêu |
|--------|----------|
| Tỷ lệ test case PASS (Must) | ≥ 90% |
| Coverage logic nghiệp vụ Loans | ≥ 80% |
| Số bug Critical còn mở | 0 |
