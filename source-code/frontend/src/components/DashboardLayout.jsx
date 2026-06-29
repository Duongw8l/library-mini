import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loansApi } from '../api/services';
import {
  Logo, IconHome, IconBook, IconUsers, IconSwap, IconChart, IconGear, IconSearch, IconBell, IconMenu, IconClose,
} from './Icons';

const ROLE_LABEL = { STUDENT: 'Sinh viên', LIBRARIAN: 'Thủ thư', ADMIN: 'Quản trị viên' };

// Menu theo vai trò.
const MENU = {
  manage: [
    { to: '/dashboard', label: 'Tổng quan (Dashboard)', icon: IconHome },
    { to: '/manage/books', label: 'Quản lý Sách', icon: IconBook },
    { to: '/manage/users', label: 'Quản lý Độc giả', icon: IconUsers },
    { to: '/manage/loans', label: 'Mượn / Trả sách', icon: IconSwap },
    { to: '/reports', label: 'Báo cáo & Thống kê', icon: IconChart },
    { to: '/settings', label: 'Cài đặt hệ thống', icon: IconGear, adminOnly: true },
  ],
  student: [
    { to: '/books', label: 'Tìm sách', icon: IconBook },
    { to: '/my-loans', label: 'Phiếu của tôi', icon: IconSwap },
  ],
};

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  const d = now.toLocaleDateString('vi-VN');
  const t = now.toLocaleTimeString('vi-VN', { hour12: false });
  return <span className="clock">{weekday}, {d}, {t}</span>;
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');
  const [alerts, setAlerts] = useState(0);
  const [navOpen, setNavOpen] = useState(false); // drawer mobile

  const isManage = user?.role === 'LIBRARIAN' || user?.role === 'ADMIN';
  const items = (isManage ? MENU.manage : MENU.student).filter(
    (m) => !m.adminOnly || user?.role === 'ADMIN'
  );

  // Số thông báo = số sách quá hạn (chỉ cho thủ thư/admin).
  useEffect(() => {
    if (isManage) loansApi.overdue().then((d) => setAlerts(d.length)).catch(() => {});
  }, [isManage]);

  // Đóng drawer mỗi khi chuyển trang.
  useEffect(() => { setNavOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/books?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="layout">
      {/* Lớp phủ khi mở drawer trên mobile */}
      {navOpen && <div className="backdrop" onClick={() => setNavOpen(false)} />}

      <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
        <div className="logo">
          <Logo />
          <span>MiniLib</span>
          <button className="lb-close" onClick={() => setNavOpen(false)} aria-label="Đóng menu"><IconClose /></button>
        </div>
        <nav className="menu">
          {items.map((m) => (
            <NavLink key={m.to} to={m.to} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <m.icon />
              <span>{m.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="lb-burger" onClick={() => setNavOpen(true)} aria-label="Mở menu"><IconMenu /></button>
          <form className="search" onSubmit={onSearch}>
            <IconSearch width={18} height={18} />
            <input placeholder="Tìm Sách / Độc giả..." value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="topbar-right">
            <Clock />
            <div className="bell">
              <IconBell />
              {alerts > 0 && <span className="bell-badge">{alerts}</span>}
            </div>
            <div className="user-chip">
              <div className="avatar">{(user?.fullName || '?').charAt(0)}</div>
              <span>{ROLE_LABEL[user?.role]} {user?.fullName?.split(' ').slice(-1)[0]}</span>
            </div>
            <button className="btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
