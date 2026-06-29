const prisma = require('../../config/prisma');
const env = require('../../config/env');

// Ánh xạ key trong DB ↔ tham số nghiệp vụ.
const DEFAULTS = {
  max_books: env.business.maxBooksPerUser,
  loan_days: env.business.loanDays,
  renew_days: env.business.renewDays,
  max_renewals: env.business.maxRenewals,
  fine_per_day: env.business.finePerDay,
};

// Đọc toàn bộ cấu hình (merge DB lên trên giá trị mặc định).
async function getAll() {
  const rows = await prisma.setting.findMany();
  const map = { ...DEFAULTS };
  for (const r of rows) {
    const num = Number(r.value);
    map[r.key] = Number.isNaN(num) ? r.value : num;
  }
  return map;
}

async function update(patch) {
  const entries = Object.entries(patch).filter(([k]) => k in DEFAULTS);
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );
  return getAll();
}

module.exports = { getAll, update, DEFAULTS };
