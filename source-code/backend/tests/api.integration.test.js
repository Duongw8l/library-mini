/**
 * Integration test cho API (Auth → Books → Loans).
 * Yêu cầu một CSDL PostgreSQL test đã migrate + seed.
 * Bật bằng: RUN_DB_TESTS=1 (nếu không sẽ được bỏ qua để `npm test` vẫn chạy được).
 *
 * Gợi ý chuẩn bị:
 *   set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/library_test
 *   npx prisma migrate deploy && npm run seed
 *   set RUN_DB_TESTS=1 && npm test
 */
const runDb = process.env.RUN_DB_TESTS === '1'; // Cờ: có chạy test cần DB hay không (đọc từ biến môi trường)
const d = runDb ? describe : describe.skip; // Nếu không bật thì bỏ qua cả nhóm test (describe.skip)

let request, app; // Khai báo biến cho supertest và app
if (runDb) { // Chỉ nạp khi thực sự chạy (tránh kết nối DB không cần thiết)
  request = require('supertest'); // Thư viện gửi request HTTP giả lập tới app
  app = require('../src/app'); // App Express để test
} // Kết thúc nhánh nạp

d('API tích hợp', () => { // Nhóm test tích hợp (chạy hoặc bị skip tùy cờ)
  let studentToken; // Token đăng nhập của sinh viên
  let librarianToken; // Token đăng nhập của thủ thư
  let bookId; // Lưu id sách để dùng giữa các test
  let loanId; // Lưu id phiếu mượn

  test('Đăng nhập thủ thư (seed)', async () => { // Test đăng nhập tài khoản thủ thư mẫu
    const res = await request(app)
      .post('/api/auth/login') // Gọi API đăng nhập
      .send({ email: 'librarian@lib.edu.vn', password: 'Pass@123' }); // Gửi thông tin đăng nhập
    expect(res.status).toBe(200); // Mong đợi thành công 200
    librarianToken = res.body.data.token; // Lưu token để dùng cho các test sau
  }); // Kết thúc test

  test('Đăng nhập sinh viên (seed)', async () => { // Test đăng nhập tài khoản sinh viên mẫu
    const res = await request(app)
      .post('/api/auth/login') // Gọi API đăng nhập
      .send({ email: 'student@lib.edu.vn', password: 'Pass@123' }); // Thông tin đăng nhập
    expect(res.status).toBe(200); // Mong đợi 200
    studentToken = res.body.data.token; // Lưu token sinh viên
  }); // Kết thúc test

  test('TC-AUTH-04: sai mật khẩu → 401', async () => { // Test đăng nhập sai mật khẩu
    const res = await request(app)
      .post('/api/auth/login') // Gọi đăng nhập
      .send({ email: 'student@lib.edu.vn', password: 'wrong' }); // Mật khẩu sai
    expect(res.status).toBe(401); // Mong đợi bị từ chối 401
  }); // Kết thúc test

  test('TC-BOOK-01: tìm kiếm sách', async () => { // Test tìm kiếm sách
    const res = await request(app).get('/api/books?q=clean'); // Tìm với từ khóa "clean"
    expect(res.status).toBe(200); // Thành công 200
    expect(Array.isArray(res.body.data)).toBe(true); // Dữ liệu trả về là mảng
    bookId = res.body.data[0]?.id; // Lưu id sách đầu tiên (nếu có) để test mượn
  }); // Kết thúc test

  test('TC-BOOK-05: sinh viên thêm sách → 403', async () => { // Test phân quyền: sinh viên không được thêm sách
    const res = await request(app)
      .post('/api/books') // Gọi API thêm sách
      .set('Authorization', `Bearer ${studentToken}`) // Dùng token sinh viên
      .send({ title: 'Sách lậu' }); // Dữ liệu sách
    expect(res.status).toBe(403); // Mong đợi bị cấm 403
  }); // Kết thúc test

  test('TC-LOAN-01: sinh viên gửi yêu cầu mượn', async () => { // Test gửi yêu cầu mượn
    const res = await request(app)
      .post('/api/loans') // Gọi API mượn
      .set('Authorization', `Bearer ${studentToken}`) // Token sinh viên
      .send({ bookId }); // Mượn sách đã tìm ở trên
    expect([201, 409]).toContain(res.status); // 409 nếu đã mượn từ lần chạy trước
    if (res.status === 201) loanId = res.body.data.id; // Nếu tạo mới thành công thì lưu id phiếu
  }); // Kết thúc test

  test('TC-LOAN-06: thủ thư duyệt mượn (nếu có phiếu)', async () => { // Test duyệt phiếu mượn
    if (!loanId) return; // Không có phiếu mới thì bỏ qua test này
    const res = await request(app)
      .patch(`/api/loans/${loanId}/approve`) // Gọi API duyệt phiếu
      .set('Authorization', `Bearer ${librarianToken}`); // Token thủ thư
    expect(res.status).toBe(200); // Thành công 200
    expect(res.body.data.status).toBe('BORROWED'); // Phiếu chuyển sang trạng thái đang mượn
  }); // Kết thúc test

  test('TC-RPT-04: sinh viên xem dashboard → 403', async () => { // Test phân quyền: sinh viên không xem được dashboard
    const res = await request(app)
      .get('/api/reports/dashboard') // Gọi API dashboard
      .set('Authorization', `Bearer ${studentToken}`); // Token sinh viên
    expect(res.status).toBe(403); // Mong đợi bị cấm 403
  }); // Kết thúc test
}); // Kết thúc nhóm test tích hợp
