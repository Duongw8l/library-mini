import { useTheme } from '../context/ThemeContext';
import { IconSun, IconMoon } from './Icons';

// Nút bật/tắt giao diện sáng - tối.
// floating=true: nút nổi ở góc (dùng cho trang đăng nhập/đăng ký, nơi không có topbar).
export default function ThemeToggle({ floating = false }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      className={`theme-toggle ${floating ? 'floating' : ''}`}
      onClick={toggleTheme}
      aria-label={dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={dark ? 'Giao diện sáng' : 'Giao diện tối'}
    >
      {dark ? <IconSun width={18} height={18} /> : <IconMoon width={18} height={18} />}
    </button>
  );
}
