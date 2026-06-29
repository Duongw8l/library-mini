-- =============================================================
-- Dữ liệu mẫu tham chiếu (PostgreSQL)
-- Khuyến nghị dùng `npm run seed` (Prisma) để có mật khẩu băm đúng.
-- File này chỉ minh họa; cột password dưới đây là CHUỖI BĂM bcrypt của "Pass@123".
-- =============================================================

-- Mật khẩu băm bcrypt của "Pass@123" (ví dụ; hãy sinh lại bằng seed.js để chắc chắn)
-- $2a$10$N9qo8uLOickgx2ZMRZoMy.MrqkU2v8YV0v4t1f0Qe0nXk8m6m2qkS

INSERT INTO users (full_name, email, password, role) VALUES
  ('Quản Trị Viên',     'admin@lib.edu.vn',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
  ('Thủ Thư',           'librarian@lib.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'LIBRARIAN'),
  ('Nguyễn Văn Sinh',   'student@lib.edu.vn',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT');

INSERT INTO categories (name) VALUES
  ('Toán học'), ('Lập trình'), ('Vật lý'), ('Văn học'), ('Kinh tế');

INSERT INTO authors (name) VALUES
  ('Nguyễn Đình Trí'), ('Robert C. Martin'), ('David Halliday'), ('Nam Cao'), ('N. Gregory Mankiw');

INSERT INTO books (title, isbn, publisher, published_year, total_copies, available_copies, category_id, author_id) VALUES
  ('Giải tích 1',                    '978-604-001', 'NXB Giáo dục', 2018, 5, 5, 1, 1),
  ('Clean Code',                     '978-013-001', 'NXB Giáo dục', 2008, 4, 4, 2, 2),
  ('Vật lý đại cương',               '978-471-001', 'NXB Giáo dục', 2014, 3, 3, 3, 3),
  ('Chí Phèo',                       '978-VN-001',  'NXB Văn học',  1941, 6, 6, 4, 4),
  ('Kinh tế học vi mô',              '978-ECO-001', 'NXB Kinh tế',  2015, 4, 4, 5, 5);

INSERT INTO settings (key, value) VALUES
  ('max_books', '5'),
  ('loan_days', '14'),
  ('renew_days', '7'),
  ('max_renewals', '2'),
  ('fine_per_day', '5000');
