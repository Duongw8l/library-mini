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
const runDb = process.env.RUN_DB_TESTS === '1';
const d = runDb ? describe : describe.skip;

let request, app;
if (runDb) {
  request = require('supertest');
  app = require('../src/app');
}

d('API tích hợp', () => {
  let studentToken;
  let librarianToken;
  let bookId;
  let loanId;

  test('Đăng nhập thủ thư (seed)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'librarian@lib.edu.vn', password: 'Pass@123' });
    expect(res.status).toBe(200);
    librarianToken = res.body.data.token;
  });

  test('Đăng nhập sinh viên (seed)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@lib.edu.vn', password: 'Pass@123' });
    expect(res.status).toBe(200);
    studentToken = res.body.data.token;
  });

  test('TC-AUTH-04: sai mật khẩu → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@lib.edu.vn', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('TC-BOOK-01: tìm kiếm sách', async () => {
    const res = await request(app).get('/api/books?q=clean');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    bookId = res.body.data[0]?.id;
  });

  test('TC-BOOK-05: sinh viên thêm sách → 403', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Sách lậu' });
    expect(res.status).toBe(403);
  });

  test('TC-LOAN-01: sinh viên gửi yêu cầu mượn', async () => {
    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ bookId });
    expect([201, 409]).toContain(res.status); // 409 nếu đã mượn từ lần chạy trước
    if (res.status === 201) loanId = res.body.data.id;
  });

  test('TC-LOAN-06: thủ thư duyệt mượn (nếu có phiếu)', async () => {
    if (!loanId) return;
    const res = await request(app)
      .patch(`/api/loans/${loanId}/approve`)
      .set('Authorization', `Bearer ${librarianToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('BORROWED');
  });

  test('TC-RPT-04: sinh viên xem dashboard → 403', async () => {
    const res = await request(app)
      .get('/api/reports/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });
});
