import { Navigate } from 'react-router-dom'; // Component điều hướng (chuyển trang)
import { useAuth } from '../context/AuthContext'; // Hook lấy thông tin đăng nhập

// Bảo vệ route: yêu cầu đăng nhập và (tùy chọn) đúng vai trò.
export default function ProtectedRoute({ children, roles }) { // children: nội dung cần bảo vệ; roles: danh sách vai trò được phép
  const { user, loading } = useAuth(); // Lấy user và trạng thái tải
  if (loading) return <div className="container">Đang tải...</div>; // Đang kiểm tra -> hiện màn chờ
  if (!user) return <Navigate to="/login" replace />; // Chưa đăng nhập -> về login
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />; // Có quy định vai trò mà user không thuộc -> về trang gốc
  return children; // Đủ điều kiện -> render nội dung
} // Kết thúc ProtectedRoute
