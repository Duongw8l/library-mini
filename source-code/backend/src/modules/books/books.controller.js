const service = require('./books.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created, paginated } = require('../../utils/response');

const list = asyncHandler(async (req, res) => {
  const result = await service.search(req.query);
  return paginated(res, result.data, result.pagination);
});

const detail = asyncHandler(async (req, res) => {
  const book = await service.getById(req.params.id);
  return ok(res, book);
});

const create = asyncHandler(async (req, res) => {
  const book = await service.create(req.body);
  return created(res, book, 'Thêm sách thành công');
});

const update = asyncHandler(async (req, res) => {
  const book = await service.update(req.params.id, req.body);
  return ok(res, book, 'Cập nhật sách thành công');
});

const updateCopies = asyncHandler(async (req, res) => {
  const book = await service.updateCopies(req.params.id, req.body.totalCopies);
  return ok(res, book, 'Cập nhật số lượng bản sao thành công');
});

const remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.id);
  return ok(res, result, 'Đã xóa sách');
});

module.exports = { list, detail, create, update, updateCopies, remove };
