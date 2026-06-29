/**
 * Unit test cho logic nghiệp vụ thuần (không cần CSDL).
 * Bao phủ: tính ngày quá hạn, cộng ngày, tính phí phạt (BR-07),
 * giới hạn gia hạn (BR-03), hạn mức mượn (BR-01).
 */
const { overdueDays, addDays, computeFine, canRenew, canBorrowMore } = require('../src/modules/loans/loan.rules');

describe('Tiện ích ngày tháng', () => {
  test('addDays cộng đúng số ngày', () => {
    const base = new Date('2026-01-01T00:00:00Z');
    expect(addDays(base, 14).toISOString()).toBe('2026-01-15T00:00:00.000Z');
  });

  test('addDays với 0 ngày trả về cùng thời điểm', () => {
    const base = new Date('2026-01-01T00:00:00Z');
    expect(addDays(base, 0).getTime()).toBe(base.getTime());
  });
});

describe('overdueDays — số ngày quá hạn (FR-27)', () => {
  test('chưa tới hạn trả về 0', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const due = new Date('2026-01-15T00:00:00Z');
    expect(overdueDays(due, now)).toBe(0);
  });

  test('đúng hạn (cùng ngày) trả về 0', () => {
    const now = new Date('2026-01-15T00:00:00Z');
    const due = new Date('2026-01-15T00:00:00Z');
    expect(overdueDays(due, now)).toBe(0);
  });

  test('trễ 3 ngày trả về 3', () => {
    const now = new Date('2026-01-18T00:00:00Z');
    const due = new Date('2026-01-15T00:00:00Z');
    expect(overdueDays(due, now)).toBe(3);
  });

  test('dueDate null trả về 0', () => {
    expect(overdueDays(null, new Date())).toBe(0);
  });
});

describe('BR-07 — Phí phạt = ngày trễ × phí/ngày', () => {
  const finePerDay = 5000;

  test('trả đúng hạn → phạt 0đ', () => {
    const due = new Date('2026-02-01T00:00:00Z');
    const now = new Date('2026-01-30T00:00:00Z');
    expect(computeFine(due, finePerDay, now)).toBe(0);
  });

  test('trễ 4 ngày → 20.000đ', () => {
    const due = new Date('2026-02-01T00:00:00Z');
    const now = new Date('2026-02-05T00:00:00Z');
    expect(computeFine(due, finePerDay, now)).toBe(20000);
  });
});

describe('BR-03 — Giới hạn số lần gia hạn', () => {
  test('lần đầu (count=0) được phép', () => expect(canRenew(0, 2)).toBe(true));
  test('lần hai (count=1) được phép', () => expect(canRenew(1, 2)).toBe(true));
  test('lần ba (count=2) bị chặn', () => expect(canRenew(2, 2)).toBe(false));
});

describe('BR-01 — Hạn mức mượn tối đa', () => {
  test('đang giữ 4 cuốn → được mượn', () => expect(canBorrowMore(4, 5)).toBe(true));
  test('đang giữ 5 cuốn → bị chặn', () => expect(canBorrowMore(5, 5)).toBe(false));
});
