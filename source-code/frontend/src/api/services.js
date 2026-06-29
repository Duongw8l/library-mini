import client from './client';

// Gói các lời gọi API theo module, trả thẳng phần `data`.

export const authApi = {
  login: (body) => client.post('/auth/login', body).then((r) => r.data.data),
  register: (body) => client.post('/auth/register', body).then((r) => r.data.data),
  me: () => client.get('/auth/me').then((r) => r.data.data),
};

export const booksApi = {
  list: (params) => client.get('/books', { params }).then((r) => r.data),
  get: (id) => client.get(`/books/${id}`).then((r) => r.data.data),
  create: (body) => client.post('/books', body).then((r) => r.data.data),
  update: (id, body) => client.put(`/books/${id}`, body).then((r) => r.data.data),
  setCopies: (id, totalCopies) => client.patch(`/books/${id}/copies`, { totalCopies }).then((r) => r.data.data),
  remove: (id) => client.delete(`/books/${id}`).then((r) => r.data.data),
};

export const categoriesApi = {
  list: () => client.get('/categories').then((r) => r.data.data),
  create: (name) => client.post('/categories', { name }).then((r) => r.data.data),
};

export const authorsApi = {
  list: () => client.get('/authors').then((r) => r.data.data),
  create: (name) => client.post('/authors', { name }).then((r) => r.data.data),
};

export const loansApi = {
  request: (bookId) => client.post('/loans', { bookId }).then((r) => r.data.data),
  my: (status) => client.get('/loans/my', { params: { status } }).then((r) => r.data.data),
  all: (status) => client.get('/loans', { params: { status } }).then((r) => r.data.data),
  overdue: () => client.get('/loans/overdue').then((r) => r.data.data),
  approve: (id) => client.patch(`/loans/${id}/approve`).then((r) => r.data.data),
  reject: (id, reason) => client.patch(`/loans/${id}/reject`, { reason }).then((r) => r.data.data),
  returnBook: (id) => client.patch(`/loans/${id}/return`).then((r) => r.data.data),
  renew: (id) => client.patch(`/loans/${id}/renew`).then((r) => r.data.data),
};

export const reportsApi = {
  dashboard: () => client.get('/reports/dashboard').then((r) => r.data.data),
  topBooks: (limit = 5) => client.get('/reports/top-books', { params: { limit } }).then((r) => r.data.data),
  loansByPeriod: (params) => client.get('/reports/loans-by-period', { params }).then((r) => r.data.data),
  loansByStatus: () => client.get('/reports/loans-by-status').then((r) => r.data.data),
  booksByCategory: () => client.get('/reports/books-by-category').then((r) => r.data.data),
  borrowReturn7days: () => client.get('/reports/borrow-return-7days').then((r) => r.data.data),
};

export const settingsApi = {
  get: () => client.get('/settings').then((r) => r.data.data),
  update: (body) => client.put('/settings', body).then((r) => r.data.data),
};

export const usersApi = {
  list: (params) => client.get('/users', { params }).then((r) => r.data.data),
  create: (body) => client.post('/users', body).then((r) => r.data.data),
  setRole: (id, role) => client.patch(`/users/${id}/role`, { role }).then((r) => r.data.data),
  setStatus: (id, active) => client.patch(`/users/${id}/status`, { active }).then((r) => r.data.data),
};
