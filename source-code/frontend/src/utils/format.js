export const STATUS_LABEL = {
  PENDING: 'Chờ duyệt',
  BORROWED: 'Đang mượn',
  OVERDUE: 'Quá hạn',
  RETURNED: 'Đã trả',
  REJECTED: 'Bị từ chối',
};

export const STATUS_CLASS = {
  PENDING: 'badge',
  BORROWED: 'badge ok',
  OVERDUE: 'badge danger',
  RETURNED: 'badge muted',
  REJECTED: 'badge danger',
};

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '-');
export const fmtMoney = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';
