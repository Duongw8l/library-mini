import client from './client'; // Axios client dùng chung (đã gắn token, xử lý lỗi)

// Gói các lời gọi API theo module, trả thẳng phần `data`.

export const authApi = { // Nhóm API xác thực
  login: (body) => client.post('/auth/login', body).then((r) => r.data.data), // Đăng nhập, trả về { token, user }
  register: (body) => client.post('/auth/register', body).then((r) => r.data.data), // Đăng ký, trả về user mới
  me: () => client.get('/auth/me').then((r) => r.data.data), // Lấy thông tin user đang đăng nhập
}; // Kết thúc authApi

export const booksApi = { // Nhóm API sách
  list: (params) => client.get('/books', { params }).then((r) => r.data), // Danh sách sách (giữ cả phần pagination -> trả r.data)
  get: (id) => client.get(`/books/${id}`).then((r) => r.data.data), // Chi tiết một sách
  create: (body) => client.post('/books', body).then((r) => r.data.data), // Thêm sách
  update: (id, body) => client.put(`/books/${id}`, body).then((r) => r.data.data), // Cập nhật sách
  setCopies: (id, totalCopies) => client.patch(`/books/${id}/copies`, { totalCopies }).then((r) => r.data.data), // Đổi số bản
  remove: (id) => client.delete(`/books/${id}`).then((r) => r.data.data), // Xóa sách
}; // Kết thúc booksApi

export const categoriesApi = { // Nhóm API thể loại
  list: () => client.get('/categories').then((r) => r.data.data), // Lấy danh sách thể loại
  create: (name) => client.post('/categories', { name }).then((r) => r.data.data), // Thêm thể loại
}; // Kết thúc categoriesApi

export const authorsApi = { // Nhóm API tác giả
  list: () => client.get('/authors').then((r) => r.data.data), // Lấy danh sách tác giả
  create: (name) => client.post('/authors', { name }).then((r) => r.data.data), // Thêm tác giả
}; // Kết thúc authorsApi

export const loansApi = { // Nhóm API mượn/trả
  request: (bookId) => client.post('/loans', { bookId }).then((r) => r.data.data), // Sinh viên gửi yêu cầu mượn
  my: (status) => client.get('/loans/my', { params: { status } }).then((r) => r.data.data), // Lấy phiếu của tôi (lọc theo trạng thái)
  all: (status) => client.get('/loans', { params: { status } }).then((r) => r.data.data), // Thủ thư lấy tất cả phiếu
  overdue: () => client.get('/loans/overdue').then((r) => r.data.data), // Lấy phiếu quá hạn
  approve: (id) => client.patch(`/loans/${id}/approve`).then((r) => r.data.data), // Duyệt phiếu
  reject: (id, reason) => client.patch(`/loans/${id}/reject`, { reason }).then((r) => r.data.data), // Từ chối phiếu kèm lý do
  returnBook: (id) => client.patch(`/loans/${id}/return`).then((r) => r.data.data), // Xác nhận trả sách
  renew: (id) => client.patch(`/loans/${id}/renew`).then((r) => r.data.data), // Gia hạn phiếu
}; // Kết thúc loansApi

export const reportsApi = { // Nhóm API báo cáo
  dashboard: () => client.get('/reports/dashboard').then((r) => r.data.data), // Số liệu tổng quan
  topBooks: (limit = 5) => client.get('/reports/top-books', { params: { limit } }).then((r) => r.data.data), // Top sách mượn nhiều
  loansByPeriod: (params) => client.get('/reports/loans-by-period', { params }).then((r) => r.data.data), // Lượt mượn theo khoảng thời gian
  loansByStatus: () => client.get('/reports/loans-by-status').then((r) => r.data.data), // Phân bố phiếu theo trạng thái
  booksByCategory: () => client.get('/reports/books-by-category').then((r) => r.data.data), // Số sách theo thể loại
  borrowReturn7days: () => client.get('/reports/borrow-return-7days').then((r) => r.data.data), // Mượn & trả 7 ngày gần nhất
}; // Kết thúc reportsApi

export const settingsApi = { // Nhóm API cấu hình
  get: () => client.get('/settings').then((r) => r.data.data), // Lấy cấu hình
  update: (body) => client.put('/settings', body).then((r) => r.data.data), // Cập nhật cấu hình
}; // Kết thúc settingsApi

export const usersApi = { // Nhóm API người dùng
  list: (params) => client.get('/users', { params }).then((r) => r.data.data), // Danh sách người dùng (tìm kiếm/lọc)
  create: (body) => client.post('/users', body).then((r) => r.data.data), // Tạo người dùng
  setRole: (id, role) => client.patch(`/users/${id}/role`, { role }).then((r) => r.data.data), // Đổi vai trò
  setStatus: (id, active) => client.patch(`/users/${id}/status`, { active }).then((r) => r.data.data), // Khóa/mở khóa
}; // Kết thúc usersApi
