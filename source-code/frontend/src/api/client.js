import axios from 'axios';

// Axios client dùng chung. baseURL '/api' đi qua proxy của Vite tới backend.
const client = axios.create({ baseURL: '/api' });

// Tự đính kèm JWT từ localStorage vào mọi request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Chuẩn hóa thông điệp lỗi từ backend.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Lỗi kết nối';
    return Promise.reject(new Error(message));
  }
);

export default client;
