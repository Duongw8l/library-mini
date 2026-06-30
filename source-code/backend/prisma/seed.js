const { PrismaClient } = require('@prisma/client'); // Lớp client để thao tác với DB
const bcrypt = require('bcryptjs'); // Thư viện băm mật khẩu

const prisma = new PrismaClient(); // Tạo client kết nối DB cho script seed

async function main() { // Hàm chính: nạp dữ liệu mẫu vào DB
  console.log('🌱 Bắt đầu seed dữ liệu...'); // In thông báo bắt đầu
  const password = await bcrypt.hash('Pass@123', 10); // Băm sẵn 1 mật khẩu chung cho mọi tài khoản mẫu

  // --- Người dùng (3 vai trò) ---
  const users = [ // Danh sách tài khoản mẫu đại diện cho 3 vai trò
    { fullName: 'Quản Trị Viên', email: 'admin@lib.edu.vn', role: 'ADMIN' }, // Tài khoản admin
    { fullName: 'Thủ Thư', email: 'librarian@lib.edu.vn', role: 'LIBRARIAN' }, // Tài khoản thủ thư
    { fullName: 'Nguyễn Văn Sinh', email: 'student@lib.edu.vn', role: 'STUDENT' }, // Tài khoản sinh viên 1
    { fullName: 'Trần Thị Viên', email: 'student2@lib.edu.vn', role: 'STUDENT' }, // Tài khoản sinh viên 2
  ]; // Kết thúc danh sách user
  for (const u of users) { // Duyệt từng user mẫu
    await prisma.user.upsert({ // upsert: có rồi thì bỏ qua, chưa có thì tạo (tránh trùng khi chạy lại seed)
      where: { email: u.email }, // Tìm theo email
      update: {}, // Đã tồn tại -> không đổi gì
      create: { ...u, password }, // Chưa có -> tạo kèm mật khẩu đã băm
    }); // Kết thúc upsert
  } // Kết thúc vòng lặp user

  // --- Thể loại ---
  const categoryNames = ['Toán học', 'Lập trình', 'Vật lý', 'Văn học', 'Kinh tế']; // Các thể loại mẫu
  const categories = {}; // Map tên thể loại -> bản ghi (để tra id khi tạo sách)
  for (const name of categoryNames) { // Duyệt từng thể loại
    categories[name] = await prisma.category.upsert({ // Tạo nếu chưa có, lưu lại bản ghi
      where: { name }, // Tìm theo tên
      update: {}, // Có rồi -> giữ nguyên
      create: { name }, // Chưa có -> tạo
    }); // Kết thúc upsert
  } // Kết thúc vòng lặp thể loại

  // --- Tác giả ---
  const authorNames = ['Nguyễn Đình Trí', 'Robert C. Martin', 'David Halliday', 'Nam Cao', 'N. Gregory Mankiw']; // Các tác giả mẫu
  const authors = []; // Mảng lưu các bản ghi tác giả theo thứ tự
  for (const name of authorNames) { // Duyệt từng tác giả
    let a = await prisma.author.findFirst({ where: { name } }); // Tìm tác giả theo tên
    if (!a) a = await prisma.author.create({ data: { name } }); // Chưa có thì tạo mới
    authors.push(a); // Lưu vào mảng (dùng index khi tạo sách)
  } // Kết thúc vòng lặp tác giả

  // --- Sách ---
  const books = [ // Danh sách sách mẫu (cat=tên thể loại, author=index trong mảng authors)
    { title: 'Giải tích 1', isbn: '978-604-001', cat: 'Toán học', author: 0, year: 2018, copies: 5 }, // Sách 1
    { title: 'Đại số tuyến tính', isbn: '978-604-002', cat: 'Toán học', author: 0, year: 2019, copies: 3 }, // Sách 2
    { title: 'Clean Code', isbn: '978-013-001', cat: 'Lập trình', author: 1, year: 2008, copies: 4 }, // Sách 3
    { title: 'Clean Architecture', isbn: '978-013-002', cat: 'Lập trình', author: 1, year: 2017, copies: 2 }, // Sách 4
    { title: 'Vật lý đại cương', isbn: '978-471-001', cat: 'Vật lý', author: 2, year: 2014, copies: 3 }, // Sách 5
    { title: 'Chí Phèo', isbn: '978-VN-001', cat: 'Văn học', author: 3, year: 1941, copies: 6 }, // Sách 6
    { title: 'Lão Hạc', isbn: '978-VN-002', cat: 'Văn học', author: 3, year: 1943, copies: 5 }, // Sách 7
    { title: 'Kinh tế học vi mô', isbn: '978-ECO-001', cat: 'Kinh tế', author: 4, year: 2015, copies: 4 }, // Sách 8
    { title: 'Kinh tế học vĩ mô', isbn: '978-ECO-002', cat: 'Kinh tế', author: 4, year: 2016, copies: 2 }, // Sách 9
    { title: 'Cấu trúc dữ liệu & Giải thuật', isbn: '978-604-003', cat: 'Lập trình', author: 1, year: 2020, copies: 1 }, // Sách 10
  ]; // Kết thúc danh sách sách
  for (const b of books) { // Duyệt từng sách mẫu
    const exists = await prisma.book.findUnique({ where: { isbn: b.isbn } }); // Kiểm tra trùng theo ISBN
    if (exists) continue; // Đã có thì bỏ qua
    await prisma.book.create({ // Tạo sách mới
      data: { // Dữ liệu sách
        title: b.title, // Tiêu đề
        isbn: b.isbn, // ISBN
        publishedYear: b.year, // Năm xuất bản
        publisher: 'NXB Giáo dục', // Nhà xuất bản (cố định cho dữ liệu mẫu)
        description: `Sách mẫu: ${b.title}`, // Mô tả tạm
        totalCopies: b.copies, // Tổng số bản
        availableCopies: b.copies, // Số bản còn (ban đầu = tổng)
        categoryId: categories[b.cat].id, // id thể loại (tra từ map)
        authorId: authors[b.author].id, // id tác giả (tra từ mảng theo index)
      }, // Kết thúc data
    }); // Kết thúc create
  } // Kết thúc vòng lặp sách

  // --- Cấu hình hệ thống ---
  const settings = { // Các tham số nghiệp vụ mặc định (lưu dạng chuỗi)
    max_books: '5', // Hạn mức mượn
    loan_days: '14', // Số ngày cho mượn
    renew_days: '7', // Số ngày gia hạn
    max_renewals: '2', // Số lần gia hạn tối đa
    fine_per_day: '5000', // Phí phạt/ngày
  }; // Kết thúc settings
  for (const [key, value] of Object.entries(settings)) { // Duyệt từng cấu hình
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } }); // Tạo nếu chưa có
  } // Kết thúc vòng lặp settings

  // --- Độc giả mẫu (thêm để Dashboard sinh động) ---
  const readers = ['Mai Lan', 'Trần Bình', 'Lê Thị Hoa', 'Phạm Văn Nam', 'Đỗ Quỳnh']; // Thêm vài độc giả để có dữ liệu thống kê
  for (let i = 0; i < readers.length; i += 1) { // Duyệt từng độc giả
    await prisma.user.upsert({ // Tạo nếu chưa có
      where: { email: `reader${i + 1}@sv.edu.vn` }, // Email theo số thứ tự
      update: {}, // Có rồi -> giữ nguyên
      create: { fullName: readers[i], email: `reader${i + 1}@sv.edu.vn`, password, role: 'STUDENT' }, // Tạo độc giả vai trò sinh viên
    }); // Kết thúc upsert
  } // Kết thúc vòng lặp độc giả

  // --- Phiếu mượn mẫu (chỉ tạo nếu chưa có phiếu nào) ---
  const DAY = 24 * 60 * 60 * 1000; // Số ms trong 1 ngày
  const daysAgo = (n) => { const d = new Date(); d.setHours(10, 0, 0, 0); return new Date(d.getTime() - n * DAY); }; // Trả về mốc thời gian n ngày trước (lúc 10h sáng)
  const addDays = (d, n) => new Date(d.getTime() + n * DAY); // Cộng n ngày vào một mốc thời gian

  if ((await prisma.loan.count()) === 0) { // Chỉ tạo phiếu mẫu khi chưa có phiếu nào (tránh nhân bản khi chạy lại)
    const allBooks = await prisma.book.findMany(); // Lấy tất cả sách
    const allReaders = await prisma.user.findMany({ where: { role: 'STUDENT' } }); // Lấy tất cả độc giả
    let bi = 0; let ri = 0; // Con trỏ vòng để lần lượt chọn sách/độc giả
    const nextBook = () => allBooks[bi++ % allBooks.length]; // Lấy sách kế tiếp (vòng tròn)
    const nextReader = () => allReaders[ri++ % allReaders.length]; // Lấy độc giả kế tiếp (vòng tròn)

    // 1) Phiếu ĐÃ TRẢ rải đều 7 ngày gần nhất → biểu đồ Mượn & Trả có dữ liệu
    const pattern = [4, 3, 5, 3, 6, 4, 3]; // index 0 = 6 ngày trước ... 6 = hôm nay
    for (let i = 0; i < 7; i += 1) { // Duyệt 7 ngày
      const dayOffset = 6 - i; // Quy đổi i sang số ngày trước (i=0 -> 6 ngày trước)
      for (let k = 0; k < pattern[i]; k += 1) { // Tạo số phiếu theo mẫu pattern cho ngày đó
        const borrowedAt = daysAgo(dayOffset + 1); // Ngày mượn = trước ngày trả 1 ngày
        await prisma.loan.create({ // Tạo phiếu đã trả
          data: { // Dữ liệu phiếu
            bookId: nextBook().id, // Sách kế tiếp
            userId: nextReader().id, // Độc giả kế tiếp
            status: 'RETURNED', // Trạng thái đã trả
            requestedAt: borrowedAt, // Thời điểm yêu cầu = thời điểm mượn
            borrowedAt, // Thời điểm mượn
            dueDate: addDays(borrowedAt, 14), // Hạn trả = mượn + 14 ngày
            returnedAt: daysAgo(dayOffset), // Thời điểm trả thực tế
            fineAmount: 0, // Không phạt
          }, // Kết thúc data
        }); // Kết thúc create
      } // Kết thúc vòng k
    } // Kết thúc vòng 7 ngày

    // 2) Phiếu QUÁ HẠN (vẫn BORROWED, dueDate trong quá khứ) → bảng "sách quá hạn"
    const overdue = [ // Danh sách phiếu quá hạn mẫu với số ngày trễ khác nhau
      { lateDays: 6 }, { lateDays: 4 }, { lateDays: 2 }, { lateDays: 1 }, // 4 phiếu trễ 6/4/2/1 ngày
    ]; // Kết thúc danh sách
    for (const o of overdue) { // Duyệt từng phiếu quá hạn
      const book = nextBook(); // Chọn sách
      if (book.availableCopies <= 0) continue; // Hết bản thì bỏ qua
      const dueDate = daysAgo(o.lateDays); // Hạn trả nằm trong quá khứ (đã trễ)
      await prisma.loan.create({ // Tạo phiếu đang mượn nhưng quá hạn
        data: { // Dữ liệu phiếu
          bookId: book.id, // Sách
          userId: nextReader().id, // Độc giả
          status: 'BORROWED', // Vẫn ở trạng thái đang mượn (OVERDUE được suy ra khi đọc)
          requestedAt: addDays(dueDate, -14), // Yêu cầu trước hạn 14 ngày
          borrowedAt: addDays(dueDate, -14), // Mượn trước hạn 14 ngày
          dueDate, // Hạn trả (đã quá)
        }, // Kết thúc data
      }); // Kết thúc create
      await prisma.book.update({ where: { id: book.id }, data: { availableCopies: { decrement: 1 } } }); // Giảm số bản còn lại của sách
    } // Kết thúc vòng quá hạn

    // 3) Vài phiếu ĐANG CHỜ DUYỆT
    for (let k = 0; k < 3; k += 1) { // Tạo 3 phiếu chờ duyệt
      await prisma.loan.create({ data: { bookId: nextBook().id, userId: nextReader().id, status: 'PENDING' } }); // Phiếu trạng thái chờ
    } // Kết thúc vòng chờ duyệt
    console.log('   + Đã tạo dữ liệu phiếu mượn mẫu (đã trả / quá hạn / chờ duyệt).'); // Báo đã tạo phiếu mẫu
  } // Kết thúc nhánh tạo phiếu mẫu

  console.log('✅ Seed hoàn tất.'); // Báo hoàn tất
  console.log('   Tài khoản (mật khẩu chung: Pass@123):'); // In hướng dẫn đăng nhập
  console.log('   - admin@lib.edu.vn (ADMIN)'); // Tài khoản admin
  console.log('   - librarian@lib.edu.vn (LIBRARIAN)'); // Tài khoản thủ thư
  console.log('   - student@lib.edu.vn (STUDENT)'); // Tài khoản sinh viên
} // Kết thúc hàm main

main() // Chạy hàm seed
  .catch((e) => { // Nếu có lỗi
    console.error(e); // In lỗi
    process.exit(1); // Thoát với mã lỗi
  }) // Kết thúc catch
  .finally(() => prisma.$disconnect()); // Dù thành công hay lỗi đều đóng kết nối DB
