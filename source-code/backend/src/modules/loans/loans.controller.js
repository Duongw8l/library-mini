const service = require('./loans.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');

const request = asyncHandler(async (req, res) => {
  const loan = await service.requestLoan(req.user.id, req.body.bookId);
  return created(res, loan, 'Đã gửi yêu cầu mượn');
});

const my = asyncHandler(async (req, res) => {
  const loans = await service.myLoans(req.user.id, req.query.status);
  return ok(res, loans);
});

const list = asyncHandler(async (req, res) => {
  const loans = await service.listAll(req.query.status);
  return ok(res, loans);
});

const overdue = asyncHandler(async (_req, res) => {
  const loans = await service.listOverdue();
  return ok(res, loans);
});

const approve = asyncHandler(async (req, res) => {
  const loan = await service.approve(req.params.id);
  return ok(res, loan, 'Đã duyệt yêu cầu mượn');
});

const reject = asyncHandler(async (req, res) => {
  const loan = await service.reject(req.params.id, req.body.reason);
  return ok(res, loan, 'Đã từ chối yêu cầu mượn');
});

const returnBook = asyncHandler(async (req, res) => {
  const loan = await service.returnBook(req.params.id);
  return ok(res, loan, 'Đã xác nhận trả sách');
});

const renew = asyncHandler(async (req, res) => {
  const loan = await service.renew(req.params.id, req.user.id);
  return ok(res, loan, 'Đã gia hạn');
});

module.exports = { request, my, list, overdue, approve, reject, returnBook, renew };
