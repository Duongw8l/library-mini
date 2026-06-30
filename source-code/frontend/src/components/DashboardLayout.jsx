import { useEffect, useState } from 'react'; // Hook quản lý state và side-effect
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom'; // Link điều hướng, hook chuyển trang/đọc URL, và chỗ chèn route con
import { useAuth } from '../context/AuthContext'; // Hook lấy thông tin đăng nhập
import { loansApi } from '../api/services'; // API mượn/trả (dùng để đếm sách quá hạn)
import ThemeToggle from './ThemeToggle'; // Nút đổi giao diện sáng/tối
import {
  Logo, IconHome, IconBook, IconUsers, IconSwap, IconChart, IconGear, IconSearch, IconBell, IconMenu, IconClose,
} from './Icons'; // Các icon dùng trong layout

const ROLE_LABEL = { STUDENT: 'Sinh viên', LIBRARIAN: 'Thủ thư', ADMIN: 'Quản trị viên' }; // Map vai trò -> nhãn tiếng Việt

// Menu theo vai trò.
const MENU = { // Định nghĩa danh sách mục menu cho từng nhóm
  manage: [ // Menu cho thủ thư/admin
    { to: '/dashboard', label: 'Tổng quan (Dashboard)', icon: IconHome }, // Trang tổng quan
    { to: '/manage/books', label: 'Quản lý Sách', icon: IconBook }, // Quản lý sách
    { to: '/manage/users', label: 'Quản lý Độc giả', icon: IconUsers }, // Quản lý người dùng
    { to: '/manage/loans', label: 'Mượn / Trả sách', icon: IconSwap }, // Quản lý mượn/trả
    { to: '/reports', label: 'Báo cáo & Thống kê', icon: IconChart }, // Báo cáo
    { to: '/settings', label: 'Cài đặt hệ thống', icon: IconGear, adminOnly: true }, // Cài đặt (chỉ admin thấy)
  ], // Kết thúc menu manage
  student: [ // Menu cho sinh viên
    { to: '/books', label: 'Tìm sách', icon: IconBook }, // Tìm sách
    { to: '/my-loans', label: 'Phiếu của tôi', icon: IconSwap }, // Phiếu mượn của tôi
  ], // Kết thúc menu student
}; // Kết thúc MENU

function Clock() { // Component đồng hồ thời gian thực trên thanh trên cùng
  const [now, setNow] = useState(new Date()); // State: thời điểm hiện tại
  useEffect(() => { // Thiết lập cập nhật mỗi giây
    const t = setInterval(() => setNow(new Date()), 1000); // Mỗi 1 giây cập nhật lại now
    return () => clearInterval(t); // Dọn dẹp: hủy interval khi component bị gỡ
  }, []); // Chỉ chạy 1 lần
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()]; // Tên thứ trong tuần
  const d = now.toLocaleDateString('vi-VN'); // Ngày theo định dạng VN
  const t = now.toLocaleTimeString('vi-VN', { hour12: false }); // Giờ 24h theo VN
  return <span className="clock">{weekday}, {d}, {t}</span>; // Hiển thị thứ, ngày, giờ
} // Kết thúc Clock

export default function DashboardLayout() { // Khung layout chính cho khu vực đã đăng nhập
  const { user, logout } = useAuth(); // Lấy user và hàm đăng xuất
  const navigate = useNavigate(); // Hàm chuyển trang
  const location = useLocation(); // Thông tin URL hiện tại
  const [q, setQ] = useState(''); // State: nội dung ô tìm kiếm
  const [alerts, setAlerts] = useState(0); // State: số thông báo (số sách quá hạn)
  // Mặc định: desktop mở sẵn sidebar, mobile đóng (mở bằng nút ☰).
  const [navOpen, setNavOpen] = useState(() => // State: sidebar đang mở hay đóng
    typeof window !== 'undefined' ? window.innerWidth > 860 : true // Màn rộng > 860px -> mở sẵn; nhỏ hơn -> đóng
  ); // Kết thúc useState navOpen

  const isManage = user?.role === 'LIBRARIAN' || user?.role === 'ADMIN'; // Cờ: user thuộc nhóm quản lý?
  const items = (isManage ? MENU.manage : MENU.student).filter( // Chọn menu theo nhóm rồi lọc
    (m) => !m.adminOnly || user?.role === 'ADMIN' // Bỏ mục adminOnly nếu không phải admin
  ); // Kết thúc tính items

  // Số thông báo = số sách quá hạn (chỉ cho thủ thư/admin).
  useEffect(() => { // Khi vai trò thay đổi
    if (isManage) loansApi.overdue().then((d) => setAlerts(d.length)).catch(() => {}); // Nếu là quản lý thì đếm phiếu quá hạn
  }, [isManage]); // Phụ thuộc isManage

  // Đóng drawer khi chuyển trang — chỉ trên mobile (desktop giữ sidebar mở).
  useEffect(() => { // Khi đổi đường dẫn
    if (window.innerWidth <= 860) setNavOpen(false); // Trên mobile thì tự đóng menu sau khi chọn
  }, [location.pathname]); // Phụ thuộc đường dẫn

  const handleLogout = () => { // Hàm xử lý đăng xuất
    logout(); // Xóa phiên đăng nhập
    navigate('/login'); // Chuyển về trang login
  }; // Kết thúc handleLogout

  const onSearch = (e) => { // Hàm xử lý khi submit ô tìm kiếm
    e.preventDefault(); // Ngăn reload trang
    navigate(`/books?q=${encodeURIComponent(q)}`); // Chuyển sang trang sách với từ khóa tìm (mã hóa an toàn)
  }; // Kết thúc onSearch

  return ( // Giao diện layout
    <div className={`layout ${navOpen ? 'nav-open' : 'nav-closed'}`}> {/* Bọc ngoài, class đổi theo trạng thái sidebar */}
      {/* Lớp phủ khi mở drawer trên mobile (ẩn trên desktop) */}
      {navOpen && <div className="backdrop" onClick={() => setNavOpen(false)} />} {/* Bấm nền mờ -> đóng menu */}

      <aside className={`sidebar ${navOpen ? 'open' : ''}`}> {/* Thanh bên (sidebar) */}
        <div className="logo"> {/* Khu vực logo */}
          <Logo /> {/* Hình logo */}
          <span>MiniLib</span> {/* Tên ứng dụng */}
          <button className="lb-close" onClick={() => setNavOpen(false)} aria-label="Đóng menu"><IconClose /></button> {/* Nút đóng menu (mobile) */}
        </div> {/* Kết thúc logo */}
        <nav className="menu"> {/* Danh sách menu */}
          {items.map((m) => ( // Duyệt từng mục menu
            <NavLink key={m.to} to={m.to} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}> {/* Link, tô đậm khi đang ở trang đó */}
              <m.icon /> {/* Icon của mục */}
              <span>{m.label}</span> {/* Nhãn của mục */}
            </NavLink> // Kết thúc NavLink
          ))} {/* Kết thúc map menu */}
        </nav> {/* Kết thúc menu */}
      </aside> {/* Kết thúc sidebar */}

      <div className="main"> {/* Khu vực nội dung chính bên phải */}
        <header className="topbar"> {/* Thanh trên cùng */}
          <button className="lb-burger" onClick={() => setNavOpen((o) => !o)} aria-label="Bật/tắt menu"><IconMenu /></button> {/* Nút ☰ thu gọn/mở sidebar */}
          <form className="search" onSubmit={onSearch}> {/* Form tìm kiếm */}
            <IconSearch width={18} height={18} /> {/* Icon kính lúp */}
            <input placeholder="Tìm Sách / Độc giả..." value={q} onChange={(e) => setQ(e.target.value)} /> {/* Ô nhập từ khóa */}
          </form> {/* Kết thúc form tìm kiếm */}
          <div className="topbar-right"> {/* Khu vực bên phải topbar */}
            <Clock /> {/* Đồng hồ */}
            <ThemeToggle /> {/* Nút đổi giao diện */}
            <div className="bell"> {/* Chuông thông báo */}
              <IconBell /> {/* Icon chuông */}
              {alerts > 0 && <span className="bell-badge">{alerts}</span>} {/* Hiện số nếu có thông báo */}
            </div> {/* Kết thúc chuông */}
            <div className="user-chip"> {/* Thẻ thông tin user */}
              <div className="avatar">{(user?.fullName || '?').charAt(0)}</div> {/* Ảnh đại diện = chữ cái đầu tên */}
              <span>{ROLE_LABEL[user?.role]} {user?.fullName?.split(' ').slice(-1)[0]}</span> {/* Vai trò + tên (lấy từ cuối) */}
            </div> {/* Kết thúc user-chip */}
            <button className="btn" onClick={handleLogout}>Logout</button> {/* Nút đăng xuất */}
          </div> {/* Kết thúc topbar-right */}
        </header> {/* Kết thúc topbar */}

        <main className="content"> {/* Vùng nội dung trang */}
          <Outlet /> {/* Chỗ React Router chèn component của route con vào */}
        </main> {/* Kết thúc content */}
      </div> {/* Kết thúc main */}
    </div> // Kết thúc layout
  ); // Kết thúc return
} // Kết thúc DashboardLayout
