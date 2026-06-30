import { createContext, useContext, useEffect, useState } from 'react'; // Hook React tạo context và quản lý state

const ThemeContext = createContext(null); // Context lưu chế độ giao diện (sáng/tối)
const STORAGE_KEY = 'minilib-theme'; // Khóa lưu lựa chọn giao diện trong localStorage

// Lấy theme ban đầu: ưu tiên lựa chọn đã lưu, nếu chưa có thì theo cài đặt hệ điều hành.
function getInitialTheme() { // Hàm xác định giao diện khởi tạo
  if (typeof window === 'undefined') return 'light'; // Phòng trường hợp chạy ngoài trình duyệt -> mặc định sáng
  const saved = localStorage.getItem(STORAGE_KEY); // Đọc lựa chọn đã lưu
  if (saved === 'light' || saved === 'dark') return saved; // Nếu hợp lệ thì dùng lại
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; // Chưa lưu -> theo cài đặt hệ điều hành
} // Kết thúc getInitialTheme

export function ThemeProvider({ children }) { // Provider cung cấp chế độ giao diện cho toàn app
  const [theme, setTheme] = useState(getInitialTheme); // State: giao diện hiện tại (khởi tạo lười)

  // Gắn thuộc tính data-theme lên <html> để CSS đổi biến màu, và lưu lại lựa chọn.
  useEffect(() => { // Chạy mỗi khi theme đổi
    document.documentElement.setAttribute('data-theme', theme); // Đặt data-theme="light/dark" cho thẻ <html>
    localStorage.setItem(STORAGE_KEY, theme); // Lưu lựa chọn để lần sau nhớ
  }, [theme]); // Phụ thuộc theme

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')); // Đảo giữa sáng và tối

  return ( // Cung cấp giá trị context
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}> {/* Chia sẻ theme và các hàm đổi */}
      {children} {/* Render con */}
    </ThemeContext.Provider> // Kết thúc Provider
  ); // Kết thúc return
} // Kết thúc ThemeProvider

export function useTheme() { // Hook lấy context giao diện
  const ctx = useContext(ThemeContext); // Lấy giá trị context
  if (!ctx) throw new Error('useTheme phải dùng bên trong <ThemeProvider>'); // Báo lỗi nếu dùng ngoài Provider
  return ctx; // Trả context
} // Kết thúc useTheme
