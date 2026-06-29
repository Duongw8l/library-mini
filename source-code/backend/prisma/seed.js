const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');
  const password = await bcrypt.hash('Pass@123', 10);

  // --- Người dùng (3 vai trò) ---
  const users = [
    { fullName: 'Quản Trị Viên', email: 'admin@lib.edu.vn', role: 'ADMIN' },
    { fullName: 'Thủ Thư', email: 'librarian@lib.edu.vn', role: 'LIBRARIAN' },
    { fullName: 'Nguyễn Văn Sinh', email: 'student@lib.edu.vn', role: 'STUDENT' },
    { fullName: 'Trần Thị Viên', email: 'student2@lib.edu.vn', role: 'STUDENT' },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password },
    });
  }

  // --- Thể loại ---
  const categoryNames = ['Toán học', 'Lập trình', 'Vật lý', 'Văn học', 'Kinh tế'];
  const categories = {};
  for (const name of categoryNames) {
    categories[name] = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- Tác giả ---
  const authorNames = ['Nguyễn Đình Trí', 'Robert C. Martin', 'David Halliday', 'Nam Cao', 'N. Gregory Mankiw'];
  const authors = [];
  for (const name of authorNames) {
    let a = await prisma.author.findFirst({ where: { name } });
    if (!a) a = await prisma.author.create({ data: { name } });
    authors.push(a);
  }

  // --- Sách ---
  const books = [
    { title: 'Giải tích 1', isbn: '978-604-001', cat: 'Toán học', author: 0, year: 2018, copies: 5 },
    { title: 'Đại số tuyến tính', isbn: '978-604-002', cat: 'Toán học', author: 0, year: 2019, copies: 3 },
    { title: 'Clean Code', isbn: '978-013-001', cat: 'Lập trình', author: 1, year: 2008, copies: 4 },
    { title: 'Clean Architecture', isbn: '978-013-002', cat: 'Lập trình', author: 1, year: 2017, copies: 2 },
    { title: 'Vật lý đại cương', isbn: '978-471-001', cat: 'Vật lý', author: 2, year: 2014, copies: 3 },
    { title: 'Chí Phèo', isbn: '978-VN-001', cat: 'Văn học', author: 3, year: 1941, copies: 6 },
    { title: 'Lão Hạc', isbn: '978-VN-002', cat: 'Văn học', author: 3, year: 1943, copies: 5 },
    { title: 'Kinh tế học vi mô', isbn: '978-ECO-001', cat: 'Kinh tế', author: 4, year: 2015, copies: 4 },
    { title: 'Kinh tế học vĩ mô', isbn: '978-ECO-002', cat: 'Kinh tế', author: 4, year: 2016, copies: 2 },
    { title: 'Cấu trúc dữ liệu & Giải thuật', isbn: '978-604-003', cat: 'Lập trình', author: 1, year: 2020, copies: 1 },
  ];
  for (const b of books) {
    const exists = await prisma.book.findUnique({ where: { isbn: b.isbn } });
    if (exists) continue;
    await prisma.book.create({
      data: {
        title: b.title,
        isbn: b.isbn,
        publishedYear: b.year,
        publisher: 'NXB Giáo dục',
        description: `Sách mẫu: ${b.title}`,
        totalCopies: b.copies,
        availableCopies: b.copies,
        categoryId: categories[b.cat].id,
        authorId: authors[b.author].id,
      },
    });
  }

  // --- Cấu hình hệ thống ---
  const settings = {
    max_books: '5',
    loan_days: '14',
    renew_days: '7',
    max_renewals: '2',
    fine_per_day: '5000',
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  // --- Độc giả mẫu (thêm để Dashboard sinh động) ---
  const readers = ['Mai Lan', 'Trần Bình', 'Lê Thị Hoa', 'Phạm Văn Nam', 'Đỗ Quỳnh'];
  for (let i = 0; i < readers.length; i += 1) {
    await prisma.user.upsert({
      where: { email: `reader${i + 1}@sv.edu.vn` },
      update: {},
      create: { fullName: readers[i], email: `reader${i + 1}@sv.edu.vn`, password, role: 'STUDENT' },
    });
  }

  // --- Phiếu mượn mẫu (chỉ tạo nếu chưa có phiếu nào) ---
  const DAY = 24 * 60 * 60 * 1000;
  const daysAgo = (n) => { const d = new Date(); d.setHours(10, 0, 0, 0); return new Date(d.getTime() - n * DAY); };
  const addDays = (d, n) => new Date(d.getTime() + n * DAY);

  if ((await prisma.loan.count()) === 0) {
    const allBooks = await prisma.book.findMany();
    const allReaders = await prisma.user.findMany({ where: { role: 'STUDENT' } });
    let bi = 0; let ri = 0;
    const nextBook = () => allBooks[bi++ % allBooks.length];
    const nextReader = () => allReaders[ri++ % allReaders.length];

    // 1) Phiếu ĐÃ TRẢ rải đều 7 ngày gần nhất → biểu đồ Mượn & Trả có dữ liệu
    const pattern = [4, 3, 5, 3, 6, 4, 3]; // index 0 = 6 ngày trước ... 6 = hôm nay
    for (let i = 0; i < 7; i += 1) {
      const dayOffset = 6 - i;
      for (let k = 0; k < pattern[i]; k += 1) {
        const borrowedAt = daysAgo(dayOffset + 1);
        await prisma.loan.create({
          data: {
            bookId: nextBook().id,
            userId: nextReader().id,
            status: 'RETURNED',
            requestedAt: borrowedAt,
            borrowedAt,
            dueDate: addDays(borrowedAt, 14),
            returnedAt: daysAgo(dayOffset),
            fineAmount: 0,
          },
        });
      }
    }

    // 2) Phiếu QUÁ HẠN (vẫn BORROWED, dueDate trong quá khứ) → bảng "sách quá hạn"
    const overdue = [
      { lateDays: 6 }, { lateDays: 4 }, { lateDays: 2 }, { lateDays: 1 },
    ];
    for (const o of overdue) {
      const book = nextBook();
      if (book.availableCopies <= 0) continue;
      const dueDate = daysAgo(o.lateDays);
      await prisma.loan.create({
        data: {
          bookId: book.id,
          userId: nextReader().id,
          status: 'BORROWED',
          requestedAt: addDays(dueDate, -14),
          borrowedAt: addDays(dueDate, -14),
          dueDate,
        },
      });
      await prisma.book.update({ where: { id: book.id }, data: { availableCopies: { decrement: 1 } } });
    }

    // 3) Vài phiếu ĐANG CHỜ DUYỆT
    for (let k = 0; k < 3; k += 1) {
      await prisma.loan.create({ data: { bookId: nextBook().id, userId: nextReader().id, status: 'PENDING' } });
    }
    console.log('   + Đã tạo dữ liệu phiếu mượn mẫu (đã trả / quá hạn / chờ duyệt).');
  }

  console.log('✅ Seed hoàn tất.');
  console.log('   Tài khoản (mật khẩu chung: Pass@123):');
  console.log('   - admin@lib.edu.vn (ADMIN)');
  console.log('   - librarian@lib.edu.vn (LIBRARIAN)');
  console.log('   - student@lib.edu.vn (STUDENT)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
