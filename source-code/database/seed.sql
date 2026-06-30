-- =============================================================
-- Dữ liệu mẫu tham chiếu (PostgreSQL)
-- Khuyến nghị dùng `npm run seed` (Prisma) để có mật khẩu băm đúng.
-- File này chỉ minh họa; cột password dưới đây là CHUỖI BĂM bcrypt của "Pass@123".
-- =============================================================

-- Mật khẩu băm bcrypt của "Pass@123" (ví dụ; hãy sinh lại bằng seed.js để chắc chắn)
-- $2a$10$N9qo8uLOickgx2ZMRZoMy.MrqkU2v8YV0v4t1f0Qe0nXk8m6m2qkS

INSERT INTO users (full_name, email, password, role) VALUES -- Thêm 3 tài khoản mẫu (3 vai trò)
  ('Quản Trị Viên',     'admin@lib.edu.vn',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'), -- Quản trị viên
  ('Thủ Thư',           'librarian@lib.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'LIBRARIAN'), -- Thủ thư
  ('Nguyễn Văn Sinh',   'student@lib.edu.vn',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT'); -- Sinh viên

INSERT INTO categories (name) VALUES -- Thêm các thể loại mẫu
  ('Toán học'), ('Lập trình'), ('Vật lý'), ('Văn học'), ('Kinh tế'); -- 5 thể loại

INSERT INTO authors (name) VALUES -- Thêm các tác giả mẫu
  ('Nguyễn Đình Trí'), ('Robert C. Martin'), ('David Halliday'), ('Nam Cao'), ('N. Gregory Mankiw'); -- 5 tác giả

INSERT INTO books (title, isbn, publisher, published_year, total_copies, available_copies, category_id, author_id) VALUES -- Thêm sách mẫu (category_id/author_id trỏ tới id theo thứ tự chèn ở trên)
  ('Giải tích 1',                    '978-604-001', 'NXB Giáo dục', 2018, 5, 5, 1, 1), -- Sách thể loại 1, tác giả 1
  ('Clean Code',                     '978-013-001', 'NXB Giáo dục', 2008, 4, 4, 2, 2), -- Thể loại 2, tác giả 2
  ('Vật lý đại cương',               '978-471-001', 'NXB Giáo dục', 2014, 3, 3, 3, 3), -- Thể loại 3, tác giả 3
  ('Chí Phèo',                       '978-VN-001',  'NXB Văn học',  1941, 6, 6, 4, 4), -- Thể loại 4, tác giả 4
  ('Kinh tế học vi mô',              '978-ECO-001', 'NXB Kinh tế',  2015, 4, 4, 5, 5); -- Thể loại 5, tác giả 5

INSERT INTO settings (key, value) VALUES -- Thêm các tham số nghiệp vụ mặc định
  ('max_books', '5'), -- Hạn mức mượn
  ('loan_days', '14'), -- Số ngày cho mượn
  ('renew_days', '7'), -- Số ngày gia hạn
  ('max_renewals', '2'), -- Số lần gia hạn tối đa
  ('fine_per_day', '5000'); -- Phí phạt/ngày
