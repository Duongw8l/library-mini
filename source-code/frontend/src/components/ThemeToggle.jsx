import { useTheme } from '../context/ThemeContext'; // Hook lấy/đổi chế độ giao diện
import { IconSun, IconMoon } from './Icons'; // Hai icon mặt trời/mặt trăng

// Nút bật/tắt giao diện sáng - tối.
// floating=true: nút nổi ở góc (dùng cho trang đăng nhập/đăng ký, nơi không có topbar).
export default function ThemeToggle({ floating = false }) { // Prop floating quyết định kiểu hiển thị (nổi hay thường)
  const { theme, toggleTheme } = useTheme(); // Lấy theme hiện tại và hàm đảo theme
  const dark = theme === 'dark'; // Cờ tiện dụng: đang ở chế độ tối?
  return ( // Render nút
    <button
      className={`theme-toggle ${floating ? 'floating' : ''}`} // Thêm class 'floating' nếu là nút nổi
      onClick={toggleTheme} // Bấm -> đổi giao diện
      aria-label={dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'} // Nhãn cho trình đọc màn hình
      title={dark ? 'Giao diện sáng' : 'Giao diện tối'} // Tooltip khi rê chuột
    >
      {dark ? <IconSun width={18} height={18} /> : <IconMoon width={18} height={18} />} {/* Tối -> hiện icon mặt trời (để bật sáng), và ngược lại */}
    </button> // Kết thúc nút
  ); // Kết thúc return
} // Kết thúc ThemeToggle
