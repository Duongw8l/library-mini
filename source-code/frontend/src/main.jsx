import React from 'react'; // Thư viện React (cần cho JSX và StrictMode)
import ReactDOM from 'react-dom/client'; // API render React vào DOM (bản React 18)
import { BrowserRouter } from 'react-router-dom'; // Bộ định tuyến phía client dựa trên URL trình duyệt
import App from './App'; // Component gốc chứa toàn bộ định tuyến trang
import { AuthProvider } from './context/AuthContext'; // Provider cung cấp trạng thái đăng nhập cho toàn app
import { ThemeProvider } from './context/ThemeContext'; // Provider cung cấp chế độ giao diện sáng/tối
import './styles.css'; // Nạp CSS toàn cục

ReactDOM.createRoot(document.getElementById('root')).render( // Gắn ứng dụng React vào thẻ có id="root" trong index.html
  <React.StrictMode> {/* Bật chế độ kiểm tra nghiêm ngặt của React (cảnh báo lỗi tiềm ẩn khi dev) */}
    <BrowserRouter> {/* Cho phép dùng định tuyến theo URL */}
      <ThemeProvider> {/* Bọc app trong context giao diện (sáng/tối) */}
        <AuthProvider> {/* Bọc app trong context đăng nhập */}
          <App /> {/* Ứng dụng chính */}
        </AuthProvider> {/* Kết thúc AuthProvider */}
      </ThemeProvider> {/* Kết thúc ThemeProvider */}
    </BrowserRouter> {/* Kết thúc BrowserRouter */}
  </React.StrictMode> // Kết thúc StrictMode
); // Kết thúc render
