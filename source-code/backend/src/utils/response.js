// Helper chuẩn hóa response JSON theo api-spec.md §1.

function ok(res, data, message, status = 200) {
  return res.status(status).json({ success: true, data, message });
}

function created(res, data, message = 'Tạo mới thành công') {
  return res.status(201).json({ success: true, data, message });
}

function paginated(res, data, pagination) {
  return res.status(200).json({ success: true, data, pagination });
}

module.exports = { ok, created, paginated };
