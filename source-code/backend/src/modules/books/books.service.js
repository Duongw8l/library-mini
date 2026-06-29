const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

function serialize(b) {
  return {
    id: b.id,
    title: b.title,
    isbn: b.isbn,
    description: b.description,
    publisher: b.publisher,
    publishedYear: b.publishedYear,
    coverUrl: b.coverUrl,
    totalCopies: b.totalCopies,
    availableCopies: b.availableCopies,
    category: b.category ? { id: b.category.id, name: b.category.name } : null,
    author: b.author ? { id: b.author.id, name: b.author.name } : null,
  };
}

// FR-10: tìm kiếm + lọc + phân trang
async function search({ q, categoryId, available, page = 1, limit = 10, sort }) {
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

  const where = { AND: [] };
  if (q) {
    where.AND.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { isbn: { contains: q, mode: 'insensitive' } },
        { author: { name: { contains: q, mode: 'insensitive' } } },
      ],
    });
  }
  if (categoryId) where.AND.push({ categoryId: parseInt(categoryId, 10) });
  if (available === 'true' || available === true) where.AND.push({ availableCopies: { gt: 0 } });

  // sort: "title" | "-createdAt" ...
  let orderBy = { createdAt: 'desc' };
  if (sort) {
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    if (['title', 'createdAt', 'publishedYear'].includes(field)) {
      orderBy = { [field]: desc ? 'desc' : 'asc' };
    }
  }

  const [total, items] = await Promise.all([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      include: { category: true, author: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: items.map(serialize),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function getById(id) {
  const book = await prisma.book.findUnique({
    where: { id: parseInt(id, 10) },
    include: { category: true, author: true },
  });
  if (!book) throw new AppError(404, 'Không tìm thấy sách');
  return serialize(book);
}

async function create(data) {
  const total = parseInt(data.totalCopies ?? 1, 10);
  const book = await prisma.book.create({
    data: {
      title: data.title,
      isbn: data.isbn || null,
      description: data.description || null,
      publisher: data.publisher || null,
      publishedYear: data.publishedYear ? parseInt(data.publishedYear, 10) : null,
      coverUrl: data.coverUrl || null,
      categoryId: data.categoryId ? parseInt(data.categoryId, 10) : null,
      authorId: data.authorId ? parseInt(data.authorId, 10) : null,
      totalCopies: total,
      availableCopies: total,
    },
    include: { category: true, author: true },
  });
  return serialize(book);
}

async function update(id, data) {
  id = parseInt(id, 10);
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Không tìm thấy sách');

  const book = await prisma.book.update({
    where: { id },
    data: {
      title: data.title ?? existing.title,
      isbn: data.isbn ?? existing.isbn,
      description: data.description ?? existing.description,
      publisher: data.publisher ?? existing.publisher,
      publishedYear:
        data.publishedYear !== undefined ? parseInt(data.publishedYear, 10) : existing.publishedYear,
      coverUrl: data.coverUrl ?? existing.coverUrl,
      categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
      authorId: data.authorId !== undefined ? data.authorId : existing.authorId,
    },
    include: { category: true, author: true },
  });
  return serialize(book);
}

// FR-15: cập nhật tổng số bản sao, giữ nhất quán availableCopies
async function updateCopies(id, totalCopies) {
  id = parseInt(id, 10);
  totalCopies = parseInt(totalCopies, 10);
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new AppError(404, 'Không tìm thấy sách');

  const borrowed = book.totalCopies - book.availableCopies; // số đang được mượn
  if (totalCopies < borrowed) {
    throw new AppError(
      409,
      `Không thể đặt tổng số bản (${totalCopies}) nhỏ hơn số đang mượn (${borrowed})`
    );
  }
  const updated = await prisma.book.update({
    where: { id },
    data: { totalCopies, availableCopies: totalCopies - borrowed },
    include: { category: true, author: true },
  });
  return serialize(updated);
}

// BR-09: không xóa nếu còn bản đang mượn
async function remove(id) {
  id = parseInt(id, 10);
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new AppError(404, 'Không tìm thấy sách');

  const activeLoans = await prisma.loan.count({
    where: { bookId: id, status: { in: ['PENDING', 'BORROWED', 'OVERDUE'] } },
  });
  if (activeLoans > 0) {
    throw new AppError(409, 'Không thể xóa: sách đang có phiếu mượn/đặt chưa hoàn tất');
  }
  await prisma.book.delete({ where: { id } });
  return { deleted: true };
}

module.exports = { search, getById, create, update, updateCopies, remove, serialize };
