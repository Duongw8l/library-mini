# Đặc tả Yêu cầu — Hệ thống Quản lý Thư viện Mini

> **Tài liệu:** `requirements.md` — Requirements (Yêu cầu chức năng & phi chức năng)
> **Phiên bản:** 1.0 — 2026-06-29

---

## 1. Yêu cầu chức năng (Functional Requirements)

Ký hiệu mức ưu tiên (MoSCoW): **M** = Must, **S** = Should, **C** = Could.

### 1.1. Xác thực & Tài khoản

| Mã | Yêu cầu | Vai trò | Ưu tiên |
|----|---------|---------|---------|
| FR-01 | Người dùng đăng ký tài khoản (mặc định role STUDENT) | Khách | M |
| FR-02 | Đăng nhập bằng email + mật khẩu, nhận JWT | Tất cả | M |
| FR-03 | Đổi mật khẩu | Tất cả | S |
| FR-04 | Xem & cập nhật hồ sơ cá nhân | Tất cả | S |

### 1.2. Quản lý sách (Books)

| Mã | Yêu cầu | Vai trò | Ưu tiên |
|----|---------|---------|---------|
| FR-10 | Tìm kiếm sách theo tiêu đề/tác giả/ISBN/thể loại, có phân trang | Tất cả | M |
| FR-11 | Xem chi tiết một đầu sách (kèm số bản còn lại) | Tất cả | M |
| FR-12 | Thêm đầu sách mới | Thủ thư | M |
| FR-13 | Sửa thông tin đầu sách | Thủ thư | M |
| FR-14 | Xóa đầu sách (chặn nếu còn bản đang mượn) | Thủ thư | M |
| FR-15 | Cập nhật tổng số bản sao của đầu sách | Thủ thư | M |
| FR-16 | Quản lý thể loại (Category) | Admin/Thủ thư | M |
| FR-17 | Quản lý tác giả, nhà xuất bản | Admin/Thủ thư | S |

### 1.3. Mượn — Trả (Loans)

| Mã | Yêu cầu | Vai trò | Ưu tiên |
|----|---------|---------|---------|
| FR-20 | Sinh viên gửi yêu cầu mượn 1 đầu sách | Sinh viên | M |
| FR-21 | Thủ thư xem danh sách yêu cầu mượn đang chờ | Thủ thư | M |
| FR-22 | Thủ thư duyệt yêu cầu mượn (giảm số bản còn) | Thủ thư | M |
| FR-23 | Thủ thư từ chối yêu cầu mượn (kèm lý do) | Thủ thư | M |
| FR-24 | Thủ thư xác nhận trả sách (tăng số bản còn) | Thủ thư | M |
| FR-25 | Sinh viên gia hạn sách đang mượn (theo BR-03, BR-04) | Sinh viên | M |
| FR-26 | Sinh viên xem lịch sử mượn — trả của bản thân | Sinh viên | M |
| FR-27 | Hệ thống tự đánh dấu phiếu quá hạn & tính phí phạt | Hệ thống | M |
| FR-28 | Thủ thư xem danh sách sách quá hạn | Thủ thư | M |

### 1.4. Báo cáo & Thống kê (Reports)

| Mã | Yêu cầu | Vai trò | Ưu tiên |
|----|---------|---------|---------|
| FR-30 | Dashboard: tổng số sách, đang mượn, quá hạn, người dùng | Thủ thư/Admin | M |
| FR-31 | Thống kê top sách được mượn nhiều nhất | Thủ thư/Admin | S |
| FR-32 | Thống kê lượt mượn theo khoảng thời gian | Thủ thư/Admin | S |
| FR-33 | Xuất báo cáo ra CSV/Excel | Admin | S |

### 1.5. Quản trị (Admin)

| Mã | Yêu cầu | Vai trò | Ưu tiên |
|----|---------|---------|---------|
| FR-40 | Liệt kê / tìm kiếm người dùng | Admin | M |
| FR-41 | Tạo / sửa / khóa / mở khóa tài khoản | Admin | M |
| FR-42 | Đổi vai trò người dùng (gán Thủ thư) | Admin | M |
| FR-43 | Cấu hình tham số hệ thống (hạn mượn, phí phạt, hạn mức) | Admin | C |

## 2. Yêu cầu phi chức năng (Non-Functional Requirements)

| Mã | Loại | Yêu cầu |
|----|------|---------|
| NFR-01 | Hiệu năng | Truy vấn tìm kiếm trả kết quả < 1s với 10.000 bản ghi (có index). |
| NFR-02 | Bảo mật | Mật khẩu băm bcrypt (≥10 salt rounds); không lưu plaintext. |
| NFR-03 | Bảo mật | Phân quyền kiểm tra ở backend qua middleware theo role. |
| NFR-04 | Bảo mật | JWT hết hạn sau 24h; chống truy cập tài nguyên không thuộc quyền. |
| NFR-05 | Tính nhất quán | Giao dịch mượn/trả dùng transaction để số liệu không sai lệch. |
| NFR-06 | Khả dụng | UI responsive, dùng được trên màn hình ≥ 1280px. |
| NFR-07 | Bảo trì | Code chia lớp (controller/service/repository); có README chạy được. |
| NFR-08 | Khả chuyển | Khởi chạy bằng `docker compose up`; seed dữ liệu mẫu sẵn. |
| NFR-09 | Kiểm thử | Backend có unit/integration test; coverage logic nghiệp vụ chính. |
| NFR-10 | Quốc tế hóa | Hỗ trợ tiếng Việt (UTF-8) cho toàn bộ dữ liệu & giao diện. |

## 3. Ràng buộc (Constraints)

- **Công nghệ:** Frontend React (Vite); Backend Node.js + Express; CSDL PostgreSQL; ORM Prisma.
- **Môi trường phát triển:** Windows 11; Node.js ≥ 20; PostgreSQL ≥ 15.
- **AI Engineering:** quá trình phát triển sử dụng Claude/ChatGPT, GitHub Copilot, Speckit;
  lưu minh chứng trong `ai-artifacts/`.

## 4. Giả định (Assumptions)

- Mỗi người dùng có một email duy nhất.
- Một yêu cầu mượn ứng với đúng một đầu sách (mượn nhiều cuốn = nhiều yêu cầu).
- Phí phạt chỉ ghi nhận, không thực hiện thanh toán trong hệ thống.
- Thời gian hệ thống dùng múi giờ máy chủ (Asia/Ho_Chi_Minh).

## 5. Ma trận truy vết Yêu cầu ↔ Vai trò (tóm tắt)

| Vai trò | Nhóm yêu cầu chính |
|---------|--------------------|
| Sinh viên | FR-01..04, FR-10, FR-11, FR-20, FR-25, FR-26 |
| Thủ thư | FR-10..17, FR-21..24, FR-27, FR-28, FR-30..32 |
| Admin | FR-16, FR-30..43 |

> Mỗi yêu cầu sẽ được ánh xạ tới task cụ thể trong `task.md` và test case trong `test-plan.md`.
