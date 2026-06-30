const service = require('./loans.service'); // Tầng service chứa logic nghiệp vụ mượn/trả
const asyncHandler = require('../../utils/asyncHandler'); // Hàm bọc tự bắt lỗi async
const { ok, created } = require('../../utils/response'); // Helper trả response 200 và 201

const request = asyncHandler(async (req, res) => { // Handler: sinh viên gửi yêu cầu mượn sách
  const loan = await service.requestLoan(req.user.id, req.body.bookId); // Tạo yêu cầu mượn cho user hiện tại với bookId gửi lên
  return created(res, loan, 'Đã gửi yêu cầu mượn'); // Trả 201 kèm phiếu mượn
}); // Kết thúc request

const my = asyncHandler(async (req, res) => { // Handler: xem các phiếu mượn của chính mình
  const loans = await service.myLoans(req.user.id, req.query.status); // Lấy phiếu mượn của user, lọc theo trạng thái (nếu có)
  return ok(res, loans); // Trả danh sách
}); // Kết thúc my

const list = asyncHandler(async (req, res) => { // Handler: thủ thư xem tất cả phiếu mượn
  const loans = await service.listAll(req.query.status); // Lấy tất cả phiếu, lọc theo trạng thái (nếu có)
  return ok(res, loans); // Trả danh sách
}); // Kết thúc list

const overdue = asyncHandler(async (_req, res) => { // Handler: xem các phiếu quá hạn
  const loans = await service.listOverdue(); // Lấy danh sách phiếu quá hạn
  return ok(res, loans); // Trả danh sách
}); // Kết thúc overdue

const approve = asyncHandler(async (req, res) => { // Handler: thủ thư duyệt yêu cầu mượn
  const loan = await service.approve(req.params.id); // Duyệt phiếu theo id
  return ok(res, loan, 'Đã duyệt yêu cầu mượn'); // Trả phiếu sau khi duyệt
}); // Kết thúc approve

const reject = asyncHandler(async (req, res) => { // Handler: thủ thư từ chối yêu cầu mượn
  const loan = await service.reject(req.params.id, req.body.reason); // Từ chối phiếu theo id, kèm lý do
  return ok(res, loan, 'Đã từ chối yêu cầu mượn'); // Trả phiếu sau khi từ chối
}); // Kết thúc reject

const returnBook = asyncHandler(async (req, res) => { // Handler: thủ thư xác nhận trả sách
  const loan = await service.returnBook(req.params.id); // Ghi nhận trả sách cho phiếu theo id
  return ok(res, loan, 'Đã xác nhận trả sách'); // Trả phiếu sau khi trả
}); // Kết thúc returnBook

const renew = asyncHandler(async (req, res) => { // Handler: sinh viên gia hạn phiếu mượn
  const loan = await service.renew(req.params.id, req.user.id); // Gia hạn phiếu theo id cho đúng chủ phiếu
  return ok(res, loan, 'Đã gia hạn'); // Trả phiếu sau khi gia hạn
}); // Kết thúc renew

module.exports = { request, my, list, overdue, approve, reject, returnBook, renew }; // Xuất các handler cho file route
