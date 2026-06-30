import axios from 'axios'; // Thư viện gọi HTTP

// Axios client dùng chung. baseURL '/api' đi qua proxy của Vite tới backend.
const client = axios.create({ baseURL: '/api' }); // Tạo client với tiền tố URL '/api' cho mọi request

// Tự đính kèm JWT từ localStorage vào mọi request.
client.interceptors.request.use((config) => { // Bộ chặn trước khi gửi request
  const token = localStorage.getItem('token'); // Lấy token đã lưu trong trình duyệt
  if (token) config.headers.Authorization = `Bearer ${token}`; // Nếu có token thì gắn vào header Authorization
  return config; // Trả config đã chỉnh để tiếp tục gửi
}); // Kết thúc interceptor request

// Chuẩn hóa thông điệp lỗi từ backend.
client.interceptors.response.use( // Bộ chặn khi nhận response
  (res) => res, // Thành công -> trả nguyên response
  (err) => { // Thất bại -> xử lý lỗi
    const message = err.response?.data?.message || err.message || 'Lỗi kết nối'; // Ưu tiên thông điệp từ backend, rồi tới lỗi axios, cuối cùng là mặc định
    return Promise.reject(new Error(message)); // Ném lại lỗi với thông điệp gọn để nơi gọi hiển thị
  } // Kết thúc hàm xử lý lỗi
); // Kết thúc interceptor response

export default client; // Xuất client để các file service dùng
