// Các hàm nghiệp vụ THUẦN (không phụ thuộc CSDL) cho mượn — trả.
// Tách riêng để dễ unit test (không cần Prisma).

const DAY_MS = 24 * 60 * 60 * 1000; // Số mili-giây trong 1 ngày (24h × 60p × 60s × 1000ms)

function addDays(date, days) { // Hàm cộng thêm số ngày vào một mốc thời gian
  return new Date(date.getTime() + days * DAY_MS); // Lấy mốc dạng ms, cộng số ngày quy ra ms, tạo Date mới
} // Kết thúc addDays

// Số ngày quá hạn so với mốc now (>= 0).
function overdueDays(dueDate, now = new Date()) { // Tính số ngày trễ; now mặc định là thời điểm hiện tại
  if (!dueDate) return 0; // Không có hạn trả -> coi như không trễ
  const diff = Math.floor((now.getTime() - new Date(dueDate).getTime()) / DAY_MS); // (hiện tại - hạn trả) quy ra số ngày nguyên
  return diff > 0 ? diff : 0; // Nếu âm (chưa tới hạn) thì trả 0
} // Kết thúc overdueDays

// BR-07: phí phạt = số ngày trễ × phí/ngày.
function computeFine(dueDate, finePerDay, now = new Date()) { // Tính tiền phạt trả trễ
  return overdueDays(dueDate, now) * finePerDay; // Số ngày trễ nhân phí mỗi ngày
} // Kết thúc computeFine

// BR-03: còn được gia hạn không.
function canRenew(renewalCount, maxRenewals) { // Kiểm tra còn lượt gia hạn không
  return renewalCount < maxRenewals; // Số lần đã gia hạn còn nhỏ hơn giới hạn -> được phép
} // Kết thúc canRenew

// BR-01: còn trong hạn mức mượn không.
function canBorrowMore(activeCount, maxBooks) { // Kiểm tra còn được mượn thêm không
  return activeCount < maxBooks; // Số sách đang mượn còn nhỏ hơn hạn mức -> được phép
} // Kết thúc canBorrowMore

module.exports = { addDays, overdueDays, computeFine, canRenew, canBorrowMore, DAY_MS }; // Xuất các hàm thuần để service và test dùng
