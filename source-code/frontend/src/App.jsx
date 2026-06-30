import { Routes, Route, Navigate } from 'react-router-dom'; // Các thành phần định tuyến: tập route, 1 route, và điều hướng
import DashboardLayout from './components/DashboardLayout'; // Khung giao diện có sidebar cho khu vực đã đăng nhập
import ProtectedRoute from './components/ProtectedRoute'; // Bọc route theo vai trò được phép
import { useAuth } from './context/AuthContext'; // Hook lấy thông tin user đang đăng nhập
import Login from './pages/Login'; // Trang đăng nhập
import Register from './pages/Register'; // Trang đăng ký
import Books from './pages/Books'; // Trang danh sách sách (công khai)
import BookDetail from './pages/BookDetail'; // Trang chi tiết sách
import MyLoans from './pages/MyLoans'; // Trang phiếu mượn của sinh viên
import ManageLoans from './pages/ManageLoans'; // Trang quản lý mượn/trả (thủ thư)
import ManageBooks from './pages/ManageBooks'; // Trang quản lý sách (thủ thư)
import ManageUsers from './pages/ManageUsers'; // Trang quản lý người dùng
import Dashboard from './pages/Dashboard'; // Trang tổng quan (dashboard)
import Reports from './pages/Reports'; // Trang báo cáo
import Settings from './pages/Settings'; // Trang cấu hình hệ thống

// Trang gốc "/" → điều hướng theo vai trò.
function RoleRedirect() { // Component quyết định chuyển hướng dựa trên vai trò
  const { user, loading } = useAuth(); // Lấy user và trạng thái đang tải
  if (loading) return <div className="splash">Đang tải...</div>; // Đang kiểm tra đăng nhập -> hiện màn chờ
  if (!user) return <Navigate to="/login" replace />; // Chưa đăng nhập -> chuyển tới trang login
  return <Navigate to={user.role === 'STUDENT' ? '/books' : '/dashboard'} replace />; // Sinh viên -> /books, còn lại -> /dashboard
} // Kết thúc RoleRedirect

// Bọc layout: yêu cầu đăng nhập mới vào được khu vực có sidebar.
function RequireAuth({ children }) { // Component bảo vệ: chỉ cho vào khi đã đăng nhập
  const { user, loading } = useAuth(); // Lấy user và trạng thái tải
  if (loading) return <div className="splash">Đang tải...</div>; // Đang tải -> màn chờ
  if (!user) return <Navigate to="/login" replace />; // Chưa đăng nhập -> về login
  return children; // Đã đăng nhập -> render nội dung bên trong
} // Kết thúc RequireAuth

const manage = ['LIBRARIAN', 'ADMIN']; // Nhóm vai trò quản lý (dùng lại cho nhiều route)

export default function App() { // Component gốc khai báo toàn bộ định tuyến
  return ( // Trả về cây route
    <Routes> {/* Tập hợp các tuyến đường */}
      <Route path="/login" element={<Login />} /> {/* /login -> trang đăng nhập */}
      <Route path="/register" element={<Register />} /> {/* /register -> trang đăng ký */}

      <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}> {/* Nhóm route cần đăng nhập, dùng chung layout sidebar */}
        <Route path="/dashboard" element={<ProtectedRoute roles={manage}><Dashboard /></ProtectedRoute>} /> {/* Dashboard: chỉ thủ thư/admin */}
        <Route path="/reports" element={<ProtectedRoute roles={manage}><Reports /></ProtectedRoute>} /> {/* Báo cáo: thủ thư/admin */}
        <Route path="/settings" element={<ProtectedRoute roles={['ADMIN']}><Settings /></ProtectedRoute>} /> {/* Cấu hình: chỉ admin */}
        <Route path="/manage/books" element={<ProtectedRoute roles={manage}><ManageBooks /></ProtectedRoute>} /> {/* Quản lý sách */}
        <Route path="/manage/users" element={<ProtectedRoute roles={manage}><ManageUsers /></ProtectedRoute>} /> {/* Quản lý người dùng */}
        <Route path="/manage/loans" element={<ProtectedRoute roles={manage}><ManageLoans /></ProtectedRoute>} /> {/* Quản lý mượn/trả */}

        <Route path="/books" element={<Books />} /> {/* Danh sách sách: ai đăng nhập cũng xem */}
        <Route path="/books/:id" element={<BookDetail />} /> {/* Chi tiết sách theo id */}
        <Route path="/my-loans" element={<ProtectedRoute roles={['STUDENT']}><MyLoans /></ProtectedRoute>} /> {/* Phiếu của tôi: chỉ sinh viên */}
      </Route> {/* Kết thúc nhóm route có layout */}

      <Route path="/" element={<RoleRedirect />} /> {/* Trang gốc: điều hướng theo vai trò */}
      <Route path="*" element={<Navigate to="/" replace />} /> {/* Mọi URL không khớp -> về trang gốc */}
    </Routes> // Kết thúc Routes
  ); // Kết thúc return
} // Kết thúc App
