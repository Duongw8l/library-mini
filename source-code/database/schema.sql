-- =============================================================
-- Hệ thống Quản lý Thư viện Mini — DDL tham chiếu (PostgreSQL)
-- Nguồn chính thức là Prisma (backend/prisma/schema.prisma).
-- File này phục vụ tra cứu / dựng tay khi không dùng Prisma migrate.
-- =============================================================

-- Kiểu liệt kê (enum)
CREATE TYPE role AS ENUM ('STUDENT', 'LIBRARIAN', 'ADMIN'); -- Định nghĩa kiểu vai trò người dùng
CREATE TYPE loan_status AS ENUM ('PENDING', 'BORROWED', 'OVERDUE', 'RETURNED', 'REJECTED'); -- Định nghĩa kiểu trạng thái phiếu mượn

-- Người dùng
CREATE TABLE users ( -- Tạo bảng người dùng
    id          SERIAL PRIMARY KEY, -- Khóa chính, tự tăng
    full_name   VARCHAR(255) NOT NULL, -- Họ tên (bắt buộc)
    email       VARCHAR(255) NOT NULL UNIQUE, -- Email, bắt buộc và không trùng
    password    VARCHAR(255) NOT NULL, -- Mật khẩu đã băm
    role        role NOT NULL DEFAULT 'STUDENT', -- Vai trò, mặc định sinh viên
    active      BOOLEAN NOT NULL DEFAULT TRUE, -- Còn hoạt động hay bị khóa
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(), -- Thời điểm tạo
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW() -- Thời điểm cập nhật
); -- Kết thúc bảng users

-- Thể loại
CREATE TABLE categories ( -- Tạo bảng thể loại
    id          SERIAL PRIMARY KEY, -- Khóa chính tự tăng
    name        VARCHAR(255) NOT NULL UNIQUE, -- Tên thể loại, không trùng
    created_at  TIMESTAMP NOT NULL DEFAULT NOW() -- Thời điểm tạo
); -- Kết thúc bảng categories

-- Tác giả
CREATE TABLE authors ( -- Tạo bảng tác giả
    id          SERIAL PRIMARY KEY, -- Khóa chính tự tăng
    name        VARCHAR(255) NOT NULL, -- Tên tác giả
    bio         TEXT, -- Tiểu sử (có thể null)
    created_at  TIMESTAMP NOT NULL DEFAULT NOW() -- Thời điểm tạo
); -- Kết thúc bảng authors

-- Sách (đầu sách)
CREATE TABLE books ( -- Tạo bảng sách
    id                SERIAL PRIMARY KEY, -- Khóa chính tự tăng
    title             VARCHAR(500) NOT NULL, -- Tiêu đề (bắt buộc)
    isbn              VARCHAR(50) UNIQUE, -- Mã ISBN, không trùng
    description       TEXT, -- Mô tả
    publisher         VARCHAR(255), -- Nhà xuất bản
    published_year    INT, -- Năm xuất bản
    cover_url         VARCHAR(500), -- Đường dẫn ảnh bìa
    total_copies      INT NOT NULL DEFAULT 1, -- Tổng số bản
    available_copies  INT NOT NULL DEFAULT 1, -- Số bản còn cho mượn
    category_id       INT REFERENCES categories(id), -- Khóa ngoại tới thể loại
    author_id         INT REFERENCES authors(id), -- Khóa ngoại tới tác giả
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(), -- Thời điểm tạo
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW() -- Thời điểm cập nhật
); -- Kết thúc bảng books
CREATE INDEX idx_books_title ON books(title); -- Chỉ mục theo tiêu đề (tăng tốc tìm kiếm)
CREATE INDEX idx_books_category ON books(category_id); -- Chỉ mục theo thể loại

-- Phiếu mượn
CREATE TABLE loans ( -- Tạo bảng phiếu mượn
    id             SERIAL PRIMARY KEY, -- Khóa chính tự tăng
    book_id        INT NOT NULL REFERENCES books(id), -- Khóa ngoại tới sách
    user_id        INT NOT NULL REFERENCES users(id), -- Khóa ngoại tới người mượn
    status         loan_status NOT NULL DEFAULT 'PENDING', -- Trạng thái, mặc định chờ duyệt
    requested_at   TIMESTAMP NOT NULL DEFAULT NOW(), -- Thời điểm gửi yêu cầu
    borrowed_at    TIMESTAMP, -- Thời điểm bắt đầu mượn
    due_date       TIMESTAMP, -- Hạn phải trả
    returned_at    TIMESTAMP, -- Thời điểm đã trả
    renewal_count  INT NOT NULL DEFAULT 0, -- Số lần đã gia hạn
    fine_amount    INT NOT NULL DEFAULT 0, -- Tiền phạt
    reject_reason  VARCHAR(500) -- Lý do bị từ chối
); -- Kết thúc bảng loans
CREATE INDEX idx_loans_status ON loans(status); -- Chỉ mục theo trạng thái
CREATE INDEX idx_loans_user ON loans(user_id); -- Chỉ mục theo người mượn

-- Lịch sử gia hạn
CREATE TABLE loan_renewals ( -- Tạo bảng lịch sử gia hạn
    id            SERIAL PRIMARY KEY, -- Khóa chính tự tăng
    loan_id       INT NOT NULL REFERENCES loans(id) ON DELETE CASCADE, -- Khóa ngoại tới phiếu; xóa phiếu thì xóa luôn lịch sử
    old_due_date  TIMESTAMP NOT NULL, -- Hạn trả cũ
    new_due_date  TIMESTAMP NOT NULL, -- Hạn trả mới
    renewed_at    TIMESTAMP NOT NULL DEFAULT NOW() -- Thời điểm gia hạn
); -- Kết thúc bảng loan_renewals

-- Cấu hình hệ thống (key/value)
CREATE TABLE settings ( -- Tạo bảng cấu hình dạng khóa-giá trị
    key    VARCHAR(100) PRIMARY KEY, -- Khóa cấu hình làm khóa chính
    value  VARCHAR(255) NOT NULL -- Giá trị (dạng chuỗi)
); -- Kết thúc bảng settings
