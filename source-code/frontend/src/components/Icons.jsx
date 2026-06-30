// Bộ icon SVG inline (không cần thư viện ngoài). stroke="currentColor" để theo màu chữ.
const base = { // Thuộc tính SVG dùng chung cho mọi icon
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', // Kích thước, khung nhìn, không tô đặc
  stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', // Vẽ bằng nét, màu theo chữ, bo tròn đầu nét
}; // Kết thúc base

export const IconHome = (p) => ( // Icon ngôi nhà (Trang chủ/Dashboard); p = props ghi đè (vd kích thước)
  <svg {...base} {...p}><path d="M3 9.5 12 3l9 6.5" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></svg> // Mái nhà, thân nhà và cửa
); // Kết thúc IconHome
export const IconBook = (p) => ( // Icon quyển sách (Sách)
  <svg {...base} {...p}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M19 3v18" /></svg> // Bìa sách và gáy sách
); // Kết thúc IconBook
export const IconUsers = (p) => ( // Icon nhóm người (Người dùng/Độc giả)
  <svg {...base} {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><path d="M16 6a3 3 0 0 1 0 6" /><path d="M18 20c0-2-1-3.5-2.5-4.5" /></svg> // Hai người chồng lên nhau
); // Kết thúc IconUsers
export const IconSwap = (p) => ( // Icon hai mũi tên đổi chiều (Mượn/Trả)
  <svg {...base} {...p}><path d="M3 8h13l-3-3" /><path d="M21 16H8l3 3" /></svg> // Mũi tên qua và mũi tên lại
); // Kết thúc IconSwap
export const IconChart = (p) => ( // Icon biểu đồ cột (Báo cáo/Thống kê)
  <svg {...base} {...p}><path d="M4 20V4" /><path d="M4 20h16" /><rect x="7" y="11" width="3" height="6" /><rect x="12" y="7" width="3" height="10" /><rect x="17" y="13" width="3" height="4" /></svg> // Trục và 3 cột
); // Kết thúc IconChart
export const IconGear = (p) => ( // Icon bánh răng (Cài đặt)
  <svg {...base} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></svg> // Tâm và vành răng cưa
); // Kết thúc IconGear
export const IconSearch = (p) => ( // Icon kính lúp (Tìm kiếm)
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg> // Vòng kính và cán
); // Kết thúc IconSearch
export const IconBell = (p) => ( // Icon chuông (Thông báo)
  <svg {...base} {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg> // Thân chuông và lưỡi gõ
); // Kết thúc IconBell
export const IconMenu = (p) => ( // Icon ba gạch ngang (☰ - mở/đóng menu)
  <svg {...base} {...p}><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></svg> // Ba đường ngang
); // Kết thúc IconMenu
export const IconClose = (p) => ( // Icon dấu X (Đóng)
  <svg {...base} {...p}><path d="M6 6l12 12" /><path d="M18 6 6 18" /></svg> // Hai đường chéo cắt nhau
); // Kết thúc IconClose
export const IconSun = (p) => ( // Icon mặt trời (chế độ sáng)
  <svg {...base} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg> // Mặt trời và các tia
); // Kết thúc IconSun
export const IconMoon = (p) => ( // Icon mặt trăng (chế độ tối)
  <svg {...base} {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg> // Trăng lưỡi liềm
); // Kết thúc IconMoon

// Logo chồng sách nhiều màu
export const Logo = (p) => ( // Logo ứng dụng: hình chồng sách
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" {...p}> {/* Khung logo, có thể ghi đè props */}
    <rect x="3" y="14" width="18" height="4" rx="1" fill="#1f3a5a" /> {/* Cuốn dưới cùng (màu xanh đậm) */}
    <rect x="4.5" y="9.5" width="15" height="4" rx="1" fill="#e0a07e" transform="rotate(-4 12 11.5)" /> {/* Cuốn giữa, nghiêng nhẹ trái */}
    <rect x="4.5" y="5" width="15" height="4" rx="1" fill="#e0744e" transform="rotate(4 12 7)" /> {/* Cuốn trên, nghiêng nhẹ phải */}
  </svg> // Kết thúc logo
); // Kết thúc Logo
