// Helper chuẩn hóa response JSON theo api-spec.md §1.

function ok(res, data, message, status = 200) { // Trả phản hồi thành công thông thường; status mặc định 200
  return res.status(status).json({ success: true, data, message }); // Gửi JSON gồm cờ thành công, dữ liệu và thông điệp
} // Kết thúc hàm ok

function created(res, data, message = 'Tạo mới thành công') { // Trả phản hồi cho trường hợp tạo mới (HTTP 201)
  return res.status(201).json({ success: true, data, message }); // Gửi JSON với mã 201 kèm dữ liệu vừa tạo
} // Kết thúc hàm created

function paginated(res, data, pagination) { // Trả phản hồi danh sách có phân trang
  return res.status(200).json({ success: true, data, pagination }); // Gửi JSON gồm dữ liệu và thông tin phân trang (trang, tổng số...)
} // Kết thúc hàm paginated

module.exports = { ok, created, paginated }; // Xuất 3 helper để controller dùng trả response thống nhất
