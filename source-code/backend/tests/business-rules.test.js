/**
 * Unit test cho logic nghiệp vụ thuần (không cần CSDL).
 * Bao phủ: tính ngày quá hạn, cộng ngày, tính phí phạt (BR-07),
 * giới hạn gia hạn (BR-03), hạn mức mượn (BR-01).
 */
const { overdueDays, addDays, computeFine, canRenew, canBorrowMore } = require('../src/modules/loans/loan.rules'); // Nhập các hàm thuần cần test

describe('Tiện ích ngày tháng', () => { // Nhóm test cho các hàm xử lý ngày
  test('addDays cộng đúng số ngày', () => { // Kiểm tra cộng ngày
    const base = new Date('2026-01-01T00:00:00Z'); // Mốc ngày gốc
    expect(addDays(base, 14).toISOString()).toBe('2026-01-15T00:00:00.000Z'); // 1/1 + 14 ngày = 15/1
  }); // Kết thúc test

  test('addDays với 0 ngày trả về cùng thời điểm', () => { // Cộng 0 ngày
    const base = new Date('2026-01-01T00:00:00Z'); // Mốc gốc
    expect(addDays(base, 0).getTime()).toBe(base.getTime()); // Kết quả phải bằng mốc gốc
  }); // Kết thúc test
}); // Kết thúc nhóm tiện ích ngày

describe('overdueDays — số ngày quá hạn (FR-27)', () => { // Nhóm test tính số ngày quá hạn
  test('chưa tới hạn trả về 0', () => { // Hiện tại trước hạn trả
    const now = new Date('2026-01-10T00:00:00Z'); // Hôm nay
    const due = new Date('2026-01-15T00:00:00Z'); // Hạn trả (sau)
    expect(overdueDays(due, now)).toBe(0); // Chưa tới hạn -> 0
  }); // Kết thúc test

  test('đúng hạn (cùng ngày) trả về 0', () => { // Đúng ngày hạn
    const now = new Date('2026-01-15T00:00:00Z'); // Hôm nay = hạn
    const due = new Date('2026-01-15T00:00:00Z'); // Hạn trả
    expect(overdueDays(due, now)).toBe(0); // Đúng hạn -> 0 (chưa trễ)
  }); // Kết thúc test

  test('trễ 3 ngày trả về 3', () => { // Quá hạn 3 ngày
    const now = new Date('2026-01-18T00:00:00Z'); // Hôm nay
    const due = new Date('2026-01-15T00:00:00Z'); // Hạn trả (trước 3 ngày)
    expect(overdueDays(due, now)).toBe(3); // Trễ 3 ngày
  }); // Kết thúc test

  test('dueDate null trả về 0', () => { // Không có hạn trả
    expect(overdueDays(null, new Date())).toBe(0); // null -> 0
  }); // Kết thúc test
}); // Kết thúc nhóm overdueDays

describe('BR-07 — Phí phạt = ngày trễ × phí/ngày', () => { // Nhóm test tính phí phạt
  const finePerDay = 5000; // Phí mỗi ngày trễ dùng cho test

  test('trả đúng hạn → phạt 0đ', () => { // Trả trước hạn
    const due = new Date('2026-02-01T00:00:00Z'); // Hạn trả
    const now = new Date('2026-01-30T00:00:00Z'); // Trả sớm
    expect(computeFine(due, finePerDay, now)).toBe(0); // Không trễ -> 0đ
  }); // Kết thúc test

  test('trễ 4 ngày → 20.000đ', () => { // Trả trễ 4 ngày
    const due = new Date('2026-02-01T00:00:00Z'); // Hạn trả
    const now = new Date('2026-02-05T00:00:00Z'); // Trả muộn 4 ngày
    expect(computeFine(due, finePerDay, now)).toBe(20000); // 4 × 5000 = 20.000đ
  }); // Kết thúc test
}); // Kết thúc nhóm phí phạt

describe('BR-03 — Giới hạn số lần gia hạn', () => { // Nhóm test giới hạn gia hạn (tối đa 2)
  test('lần đầu (count=0) được phép', () => expect(canRenew(0, 2)).toBe(true)); // Chưa gia hạn -> được
  test('lần hai (count=1) được phép', () => expect(canRenew(1, 2)).toBe(true)); // Đã gia hạn 1 lần -> còn được
  test('lần ba (count=2) bị chặn', () => expect(canRenew(2, 2)).toBe(false)); // Đã đủ 2 lần -> chặn
}); // Kết thúc nhóm BR-03

describe('BR-01 — Hạn mức mượn tối đa', () => { // Nhóm test hạn mức mượn (tối đa 5)
  test('đang giữ 4 cuốn → được mượn', () => expect(canBorrowMore(4, 5)).toBe(true)); // 4 < 5 -> còn được mượn
  test('đang giữ 5 cuốn → bị chặn', () => expect(canBorrowMore(5, 5)).toBe(false)); // 5 = 5 -> hết hạn mức
}); // Kết thúc nhóm BR-01
