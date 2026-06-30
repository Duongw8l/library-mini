export const STATUS_LABEL = { // Map mã trạng thái phiếu -> nhãn tiếng Việt hiển thị
  PENDING: 'Chờ duyệt', // Đang chờ thủ thư duyệt
  BORROWED: 'Đang mượn', // Đang mượn
  OVERDUE: 'Quá hạn', // Quá hạn trả
  RETURNED: 'Đã trả', // Đã trả sách
  REJECTED: 'Bị từ chối', // Yêu cầu bị từ chối
}; // Kết thúc STATUS_LABEL

export const STATUS_CLASS = { // Map mã trạng thái -> class CSS để tô màu nhãn (badge)
  PENDING: 'badge', // Màu mặc định
  BORROWED: 'badge ok', // Màu "ổn" (xanh)
  OVERDUE: 'badge danger', // Màu cảnh báo (đỏ)
  RETURNED: 'badge muted', // Màu mờ (đã xong)
  REJECTED: 'badge danger', // Màu cảnh báo (đỏ)
}; // Kết thúc STATUS_CLASS

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '-'); // Định dạng ngày kiểu VN; không có thì hiện '-'
export const fmtMoney = (n) => (n || 0).toLocaleString('vi-VN') + 'đ'; // Định dạng tiền kiểu VN, thêm hậu tố 'đ'; null -> 0
