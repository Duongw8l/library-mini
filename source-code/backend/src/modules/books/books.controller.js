const service = require('./books.service'); // Tầng service chứa logic nghiệp vụ về sách
const asyncHandler = require('../../utils/asyncHandler'); // Hàm bọc tự bắt lỗi async
const { ok, created, paginated } = require('../../utils/response'); // Helper trả response (200, 201, danh sách phân trang)

const list = asyncHandler(async (req, res) => { // Handler lấy danh sách sách (có tìm kiếm/lọc)
  const result = await service.search(req.query); // Gọi service tìm kiếm theo tham số trên URL (req.query)
  return paginated(res, result.data, result.pagination); // Trả danh sách kèm thông tin phân trang
}); // Kết thúc list

const detail = asyncHandler(async (req, res) => { // Handler xem chi tiết một sách
  const book = await service.getById(req.params.id); // Lấy sách theo id trên đường dẫn (req.params.id)
  return ok(res, book); // Trả 200 kèm dữ liệu sách
}); // Kết thúc detail

const create = asyncHandler(async (req, res) => { // Handler thêm sách mới
  const book = await service.create(req.body); // Tạo sách từ dữ liệu gửi lên
  return created(res, book, 'Thêm sách thành công'); // Trả 201 kèm sách vừa tạo
}); // Kết thúc create

const update = asyncHandler(async (req, res) => { // Handler cập nhật thông tin sách
  const book = await service.update(req.params.id, req.body); // Cập nhật sách theo id với dữ liệu mới
  return ok(res, book, 'Cập nhật sách thành công'); // Trả 200 kèm sách sau cập nhật
}); // Kết thúc update

const updateCopies = asyncHandler(async (req, res) => { // Handler cập nhật số lượng bản sao của sách
  const book = await service.updateCopies(req.params.id, req.body.totalCopies); // Đặt lại tổng số bản theo id
  return ok(res, book, 'Cập nhật số lượng bản sao thành công'); // Trả 200 kèm sách sau cập nhật
}); // Kết thúc updateCopies

const remove = asyncHandler(async (req, res) => { // Handler xóa sách
  const result = await service.remove(req.params.id); // Xóa sách theo id (kèm kiểm tra ràng buộc)
  return ok(res, result, 'Đã xóa sách'); // Trả 200 báo đã xóa
}); // Kết thúc remove

module.exports = { list, detail, create, update, updateCopies, remove }; // Xuất các handler cho file route
