import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Bảo vệ route: yêu cầu đăng nhập và (tùy chọn) đúng vai trò.
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
