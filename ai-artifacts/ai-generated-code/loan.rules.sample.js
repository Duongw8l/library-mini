// Các hàm nghiệp vụ THUẦN (không phụ thuộc CSDL) cho mượn — trả.
// Tách riêng để dễ unit test (không cần Prisma).

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

// Số ngày quá hạn so với mốc now (>= 0).
function overdueDays(dueDate, now = new Date()) {
  if (!dueDate) return 0;
  const diff = Math.floor((now.getTime() - new Date(dueDate).getTime()) / DAY_MS);
  return diff > 0 ? diff : 0;
}

// BR-07: phí phạt = số ngày trễ × phí/ngày.
function computeFine(dueDate, finePerDay, now = new Date()) {
  return overdueDays(dueDate, now) * finePerDay;
}

// BR-03: còn được gia hạn không.
function canRenew(renewalCount, maxRenewals) {
  return renewalCount < maxRenewals;
}

// BR-01: còn trong hạn mức mượn không.
function canBorrowMore(activeCount, maxBooks) {
  return activeCount < maxBooks;
}

module.exports = { addDays, overdueDays, computeFine, canRenew, canBorrowMore, DAY_MS };
