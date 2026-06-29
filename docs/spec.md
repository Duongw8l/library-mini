# Đặc tả Hệ thống — Hệ thống Quản lý Thư viện Mini

> **Tài liệu:** `spec.md` — Specification (Đặc tả bài toán & phạm vi)
> **Đề tài:** 6 — Hệ thống Quản lý Thư viện Mini
> **Phương pháp:** Spec-Driven Development (SDD) — AI Engineering
> **Phiên bản:** 1.0
> **Ngày cập nhật:** 2026-06-29

---

## 1. Bối cảnh & Bài toán (Problem)

Nhiều thư viện khoa hoặc thư viện quy mô nhỏ chưa có hệ thống quản lý chuyên nghiệp.
Việc quản lý sách và quá trình mượn — trả hiện nay thường được thực hiện thủ công
bằng sổ giấy, file Excel rời rạc, dẫn đến:

- Khó tra cứu nhanh tình trạng (còn/hết) của một đầu sách.
- Dễ sai sót khi ghi nhận mượn — trả, thất lạc sách.
- Không theo dõi được sách quá hạn, không nhắc nhở người mượn.
- Không có số liệu thống kê phục vụ báo cáo hoạt động thư viện.

**Mục tiêu:** Xây dựng hệ thống quản lý thư viện trực tuyến giúp số hóa toàn bộ
hoạt động quản lý tài nguyên học tập, mượn — trả, và thống kê.

## 2. Mục tiêu sản phẩm (Goals)

| Mã | Mục tiêu | Tiêu chí đo lường |
|----|----------|-------------------|
| G1 | Quản lý tập trung thông tin sách và người đọc | 100% sách/người dùng lưu trên 1 CSDL duy nhất |
| G2 | Theo dõi chính xác tình trạng mượn — trả | Số lượng `available` luôn khớp với phiếu mượn đang mở |
| G3 | Hỗ trợ tìm kiếm sách nhanh chóng | Tìm theo tiêu đề/tác giả/ISBN/thể loại < 1s |
| G4 | Cung cấp báo cáo thống kê hoạt động | Xuất được báo cáo theo khoảng thời gian, theo thể loại |

## 3. Phạm vi (Scope)

### 3.1. Trong phạm vi (In-scope)

- Quản lý danh mục sách (đầu sách, bản sao, thể loại, tác giả).
- Quy trình mượn — trả: đăng ký mượn → duyệt → trả → gia hạn.
- Quản lý sách quá hạn và tính phí phạt (theo cấu hình).
- Phân quyền 3 vai trò: Sinh viên, Thủ thư, Quản trị viên.
- Báo cáo & thống kê (theo thời gian, theo thể loại, top sách mượn nhiều).
- Xác thực người dùng bằng JWT.

### 3.2. Ngoài phạm vi (Out-of-scope)

- Thanh toán phí phạt trực tuyến (chỉ ghi nhận số tiền, không tích hợp cổng thanh toán).
- Đọc sách điện tử (e-book reader) trong hệ thống.
- Tích hợp RFID/máy quét mã vạch phần cứng (chỉ hỗ trợ nhập ISBN thủ công).
- Gửi email/SMS nhắc hạn thật (chỉ tạo thông báo nội bộ trong hệ thống).

## 4. Đối tượng người dùng (Actors)

| Vai trò | Mô tả | Quyền chính |
|---------|-------|-------------|
| **Sinh viên (STUDENT)** | Người đọc, mượn sách | Tìm kiếm, xem, đăng ký mượn, gia hạn, xem lịch sử |
| **Thủ thư (LIBRARIAN)** | Nhân viên quản lý sách & mượn trả | Quản lý đầu sách, duyệt mượn, xác nhận trả, xử lý quá hạn |
| **Quản trị viên (ADMIN)** | Quản trị hệ thống | Quản lý tài khoản, danh mục, phân quyền, xuất báo cáo |

## 5. Chức năng chính theo vai trò (Features)

### 5.1. Sinh viên
- F-ST-01 — Tìm kiếm sách (theo tiêu đề, tác giả, ISBN, thể loại).
- F-ST-02 — Xem thông tin chi tiết sách (mô tả, số lượng còn lại).
- F-ST-03 — Đăng ký mượn sách.
- F-ST-04 — Xem lịch sử mượn — trả của bản thân.
- F-ST-05 — Gia hạn sách đang mượn.

### 5.2. Thủ thư
- F-LB-01 — Quản lý đầu sách (thêm/sửa/xóa sách, thêm bản sao).
- F-LB-02 — Duyệt / từ chối yêu cầu mượn.
- F-LB-03 — Xác nhận trả sách.
- F-LB-04 — Quản lý sách quá hạn (xem danh sách, tính phí phạt).
- F-LB-05 — Cập nhật số lượng sách (số bản sao).

### 5.3. Quản trị viên
- F-AD-01 — Quản lý tài khoản người dùng (CRUD, khóa/mở khóa).
- F-AD-02 — Quản lý danh mục sách (thể loại, tác giả, nhà xuất bản).
- F-AD-03 — Xuất báo cáo thống kê.

## 6. Quy tắc nghiệp vụ (Business Rules)

| Mã | Quy tắc |
|----|---------|
| BR-01 | Một sinh viên được mượn tối đa **5 cuốn** cùng lúc (cấu hình được). |
| BR-02 | Thời hạn mượn mặc định **14 ngày**. |
| BR-03 | Mỗi phiếu mượn được gia hạn tối đa **2 lần**, mỗi lần thêm 7 ngày. |
| BR-04 | Không gia hạn được nếu sách đã quá hạn hoặc có người khác đặt giữ. |
| BR-05 | Chỉ mượn được khi `available_copies > 0`. |
| BR-06 | Sinh viên đang có sách quá hạn **không được** mượn thêm. |
| BR-07 | Phí phạt = số ngày quá hạn × mức phạt/ngày (mặc định 5.000đ/ngày). |
| BR-08 | Khi duyệt mượn: `available_copies -= 1`; khi trả: `available_copies += 1`. |
| BR-09 | Không xóa được đầu sách nếu còn bản sao đang được mượn. |

## 7. Yêu cầu phi chức năng (tóm tắt)

- **Hiệu năng:** tìm kiếm < 1s với ~10.000 đầu sách.
- **Bảo mật:** mật khẩu băm bằng bcrypt; phân quyền theo role ở backend.
- **Khả dụng:** chạy được trên trình duyệt hiện đại (Chrome, Edge, Firefox).
- **Khả chuyển:** triển khai bằng Docker Compose; chạy local trên Windows/Linux.

> Chi tiết yêu cầu xem `requirements.md`. Kiến trúc xem `architecture.md`.
> Đặc tả API xem `api-spec.md`. Kế hoạch kiểm thử xem `test-plan.md`.

## 8. Tiêu chí nghiệm thu tổng thể (Definition of Done)

1. Đủ 3 vai trò đăng nhập và thực hiện được các chức năng chính ở mục 5.
2. Luồng mượn — duyệt — trả — gia hạn hoạt động đúng các quy tắc nghiệp vụ mục 6.
3. Số lượng sách `available` luôn nhất quán sau mỗi giao dịch.
4. Có ít nhất 1 báo cáo thống kê xuất ra được.
5. Bộ test backend đạt tỷ lệ pass ≥ 90% các test case trong `test-plan.md`.
