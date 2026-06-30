const prisma = require('../../config/prisma'); // Client truy vấn DB
const AppError = require('../../utils/AppError'); // Lớp lỗi tùy biến

function serialize(b) { // Hàm chuyển bản ghi sách trong DB thành dạng gọn để trả ra API
  return { // Trả về object chỉ gồm các trường cần thiết
    id: b.id, // Mã sách
    title: b.title, // Tiêu đề
    isbn: b.isbn, // Mã ISBN
    description: b.description, // Mô tả
    publisher: b.publisher, // Nhà xuất bản
    publishedYear: b.publishedYear, // Năm xuất bản
    coverUrl: b.coverUrl, // Đường dẫn ảnh bìa
    totalCopies: b.totalCopies, // Tổng số bản
    availableCopies: b.availableCopies, // Số bản còn cho mượn
    category: b.category ? { id: b.category.id, name: b.category.name } : null, // Thông tin thể loại (nếu có)
    author: b.author ? { id: b.author.id, name: b.author.name } : null, // Thông tin tác giả (nếu có)
  }; // Kết thúc object trả về
} // Kết thúc serialize

// FR-10: tìm kiếm + lọc + phân trang
async function search({ q, categoryId, available, page = 1, limit = 10, sort }) { // Tìm sách theo từ khóa, thể loại, tình trạng còn sách, phân trang, sắp xếp
  page = Math.max(1, parseInt(page, 10) || 1); // Chuẩn hóa số trang: tối thiểu 1
  limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10)); // Chuẩn hóa số dòng/trang: trong khoảng 1..100

  const where = { AND: [] }; // Khởi tạo điều kiện lọc: gom nhiều điều kiện bằng AND
  if (q) { // Nếu có từ khóa tìm kiếm
    where.AND.push({ // Thêm điều kiện tìm theo nhiều trường
      OR: [ // Khớp 1 trong các trường sau
        { title: { contains: q, mode: 'insensitive' } }, // Tiêu đề chứa từ khóa (không phân biệt hoa/thường)
        { isbn: { contains: q, mode: 'insensitive' } }, // Hoặc ISBN chứa từ khóa
        { author: { name: { contains: q, mode: 'insensitive' } } }, // Hoặc tên tác giả chứa từ khóa
      ], // Kết thúc OR
    }); // Kết thúc push điều kiện q
  } // Kết thúc nhánh q
  if (categoryId) where.AND.push({ categoryId: parseInt(categoryId, 10) }); // Nếu lọc theo thể loại: thêm điều kiện categoryId
  if (available === 'true' || available === true) where.AND.push({ availableCopies: { gt: 0 } }); // Nếu chỉ lấy sách còn cho mượn: availableCopies > 0

  // sort: "title" | "-createdAt" ...
  let orderBy = { createdAt: 'desc' }; // Mặc định sắp xếp theo ngày tạo mới nhất
  if (sort) { // Nếu client chỉ định cách sắp xếp
    const desc = sort.startsWith('-'); // Dấu '-' đầu chuỗi nghĩa là giảm dần
    const field = desc ? sort.slice(1) : sort; // Lấy tên trường (bỏ dấu '-' nếu có)
    if (['title', 'createdAt', 'publishedYear'].includes(field)) { // Chỉ cho phép sắp xếp theo các trường an toàn này
      orderBy = { [field]: desc ? 'desc' : 'asc' }; // Đặt chiều sắp xếp tương ứng
    } // Kết thúc kiểm tra field hợp lệ
  } // Kết thúc nhánh sort

  const [total, items] = await Promise.all([ // Chạy song song 2 truy vấn cho nhanh
    prisma.book.count({ where }), // Đếm tổng số sách khớp điều kiện (để tính phân trang)
    prisma.book.findMany({ // Lấy danh sách sách của trang hiện tại
      where, // Áp điều kiện lọc
      include: { category: true, author: true }, // Lấy kèm thông tin thể loại và tác giả
      orderBy, // Áp cách sắp xếp
      skip: (page - 1) * limit, // Bỏ qua các bản ghi của những trang trước
      take: limit, // Lấy đúng số bản ghi của một trang
    }), // Kết thúc findMany
  ]); // Kết thúc Promise.all

  return { // Trả kết quả
    data: items.map(serialize), // Danh sách sách đã rút gọn
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }, // Thông tin phân trang (tổng số trang tối thiểu 1)
  }; // Kết thúc return
} // Kết thúc search

async function getById(id) { // Lấy chi tiết một sách theo id
  const book = await prisma.book.findUnique({ // Tìm sách duy nhất theo id
    where: { id: parseInt(id, 10) }, // Ép id sang số nguyên
    include: { category: true, author: true }, // Lấy kèm thể loại và tác giả
  }); // Kết thúc findUnique
  if (!book) throw new AppError(404, 'Không tìm thấy sách'); // Không có -> 404
  return serialize(book); // Trả sách đã rút gọn
} // Kết thúc getById

async function create(data) { // Tạo sách mới
  const total = parseInt(data.totalCopies ?? 1, 10); // Số bản tổng (mặc định 1 nếu không truyền)
  const book = await prisma.book.create({ // Tạo bản ghi sách
    data: { // Dữ liệu sách
      title: data.title, // Tiêu đề
      isbn: data.isbn || null, // ISBN (rỗng -> null)
      description: data.description || null, // Mô tả
      publisher: data.publisher || null, // Nhà xuất bản
      publishedYear: data.publishedYear ? parseInt(data.publishedYear, 10) : null, // Năm xuất bản (ép số nếu có)
      coverUrl: data.coverUrl || null, // Ảnh bìa
      categoryId: data.categoryId ? parseInt(data.categoryId, 10) : null, // Thể loại (ép số nếu có)
      authorId: data.authorId ? parseInt(data.authorId, 10) : null, // Tác giả (ép số nếu có)
      totalCopies: total, // Tổng số bản
      availableCopies: total, // Lúc mới tạo, số bản còn = tổng số bản
    }, // Kết thúc data
    include: { category: true, author: true }, // Lấy kèm thể loại, tác giả để trả về
  }); // Kết thúc create
  return serialize(book); // Trả sách vừa tạo (đã rút gọn)
} // Kết thúc create

async function update(id, data) { // Cập nhật thông tin sách
  id = parseInt(id, 10); // Ép id sang số nguyên
  const existing = await prisma.book.findUnique({ where: { id } }); // Lấy bản ghi hiện tại
  if (!existing) throw new AppError(404, 'Không tìm thấy sách'); // Không có -> 404

  const book = await prisma.book.update({ // Cập nhật sách
    where: { id }, // Theo id
    data: { // Mỗi trường: nếu client gửi giá trị mới thì dùng, không thì giữ giá trị cũ (?? = nullish)
      title: data.title ?? existing.title, // Tiêu đề
      isbn: data.isbn ?? existing.isbn, // ISBN
      description: data.description ?? existing.description, // Mô tả
      publisher: data.publisher ?? existing.publisher, // Nhà xuất bản
      publishedYear:
        data.publishedYear !== undefined ? parseInt(data.publishedYear, 10) : existing.publishedYear, // Năm XB: chỉ đổi khi có truyền
      coverUrl: data.coverUrl ?? existing.coverUrl, // Ảnh bìa
      categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId, // Thể loại
      authorId: data.authorId !== undefined ? data.authorId : existing.authorId, // Tác giả
    }, // Kết thúc data
    include: { category: true, author: true }, // Lấy kèm thể loại, tác giả
  }); // Kết thúc update
  return serialize(book); // Trả sách sau cập nhật
} // Kết thúc update

// FR-15: cập nhật tổng số bản sao, giữ nhất quán availableCopies
async function updateCopies(id, totalCopies) { // Đổi tổng số bản của một sách
  id = parseInt(id, 10); // Ép id sang số
  totalCopies = parseInt(totalCopies, 10); // Ép tổng số bản mới sang số
  const book = await prisma.book.findUnique({ where: { id } }); // Lấy sách hiện tại
  if (!book) throw new AppError(404, 'Không tìm thấy sách'); // Không có -> 404

  const borrowed = book.totalCopies - book.availableCopies; // số đang được mượn
  if (totalCopies < borrowed) { // Nếu đặt tổng số bản nhỏ hơn số đang mượn -> vô lý
    throw new AppError( // Báo lỗi xung đột
      409, // Mã 409
      `Không thể đặt tổng số bản (${totalCopies}) nhỏ hơn số đang mượn (${borrowed})` // Thông điệp
    ); // Kết thúc throw
  } // Kết thúc kiểm tra
  const updated = await prisma.book.update({ // Cập nhật số bản
    where: { id }, // Theo id
    data: { totalCopies, availableCopies: totalCopies - borrowed }, // Tổng mới và số còn lại = tổng mới - số đang mượn
    include: { category: true, author: true }, // Lấy kèm thể loại, tác giả
  }); // Kết thúc update
  return serialize(updated); // Trả sách sau cập nhật
} // Kết thúc updateCopies

// BR-09: không xóa nếu còn bản đang mượn
async function remove(id) { // Xóa sách
  id = parseInt(id, 10); // Ép id sang số
  const book = await prisma.book.findUnique({ where: { id } }); // Lấy sách
  if (!book) throw new AppError(404, 'Không tìm thấy sách'); // Không có -> 404

  const activeLoans = await prisma.loan.count({ // Đếm số phiếu mượn/đặt chưa hoàn tất của sách này
    where: { bookId: id, status: { in: ['PENDING', 'BORROWED', 'OVERDUE'] } }, // Trạng thái đang chờ/đang mượn/quá hạn
  }); // Kết thúc count
  if (activeLoans > 0) { // Nếu còn phiếu chưa xong
    throw new AppError(409, 'Không thể xóa: sách đang có phiếu mượn/đặt chưa hoàn tất'); // Chặn xóa
  } // Kết thúc kiểm tra
  await prisma.book.delete({ where: { id } }); // Xóa sách khỏi DB
  return { deleted: true }; // Báo đã xóa
} // Kết thúc remove

module.exports = { search, getById, create, update, updateCopies, remove, serialize }; // Xuất các hàm nghiệp vụ (serialize dùng lại ở module khác)
