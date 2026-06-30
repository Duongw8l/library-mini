const prisma = require('../../config/prisma'); // Client truy vấn DB
const env = require('../../config/env'); // Cấu hình mặc định lấy từ biến môi trường

// Ánh xạ key trong DB ↔ tham số nghiệp vụ.
const DEFAULTS = { // Giá trị mặc định cho các tham số nghiệp vụ (dùng khi DB chưa có)
  max_books: env.business.maxBooksPerUser, // Số sách tối đa mỗi người mượn
  loan_days: env.business.loanDays, // Số ngày cho mượn
  renew_days: env.business.renewDays, // Số ngày mỗi lần gia hạn
  max_renewals: env.business.maxRenewals, // Số lần gia hạn tối đa
  fine_per_day: env.business.finePerDay, // Phí phạt mỗi ngày trễ
}; // Kết thúc DEFAULTS

// Đọc toàn bộ cấu hình (merge DB lên trên giá trị mặc định).
async function getAll() { // Lấy tất cả tham số cấu hình hiện hành
  const rows = await prisma.setting.findMany(); // Đọc các cấu hình đã lưu trong DB
  const map = { ...DEFAULTS }; // Bắt đầu từ giá trị mặc định
  for (const r of rows) { // Duyệt từng dòng cấu hình trong DB
    const num = Number(r.value); // Thử ép giá trị sang số
    map[r.key] = Number.isNaN(num) ? r.value : num; // Nếu là số thì lưu số, không thì giữ chuỗi; ghi đè mặc định
  } // Kết thúc vòng lặp
  return map; // Trả về bộ cấu hình đã gộp
} // Kết thúc getAll

async function update(patch) { // Cập nhật một phần cấu hình
  const entries = Object.entries(patch).filter(([k]) => k in DEFAULTS); // Chỉ nhận các key hợp lệ (có trong DEFAULTS), bỏ key lạ
  await Promise.all( // Cập nhật song song các key
    entries.map(([key, value]) => // Với mỗi cặp key-value
      prisma.setting.upsert({ // upsert: có thì cập nhật, chưa có thì tạo mới
        where: { key }, // Tìm theo key
        update: { value: String(value) }, // Nếu tồn tại -> cập nhật giá trị (lưu dạng chuỗi)
        create: { key, value: String(value) }, // Nếu chưa có -> tạo mới
      }) // Kết thúc upsert
    ) // Kết thúc map
  ); // Kết thúc Promise.all
  return getAll(); // Trả lại toàn bộ cấu hình sau khi cập nhật
} // Kết thúc update

module.exports = { getAll, update, DEFAULTS }; // Xuất các hàm cho route và module loans dùng
