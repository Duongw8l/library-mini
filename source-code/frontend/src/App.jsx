import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import MyLoans from './pages/MyLoans';
import ManageLoans from './pages/ManageLoans';
import ManageBooks from './pages/ManageBooks';
import ManageUsers from './pages/ManageUsers';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Trang gốc "/" → điều hướng theo vai trò.
function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'STUDENT' ? '/books' : '/dashboard'} replace />;
}

// Bọc layout: yêu cầu đăng nhập mới vào được khu vực có sidebar.
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const manage = ['LIBRARIAN', 'ADMIN'];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route path="/dashboard" element={<ProtectedRoute roles={manage}><Dashboard /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={manage}><Reports /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute roles={['ADMIN']}><Settings /></ProtectedRoute>} />
        <Route path="/manage/books" element={<ProtectedRoute roles={manage}><ManageBooks /></ProtectedRoute>} />
        <Route path="/manage/users" element={<ProtectedRoute roles={manage}><ManageUsers /></ProtectedRoute>} />
        <Route path="/manage/loans" element={<ProtectedRoute roles={manage}><ManageLoans /></ProtectedRoute>} />

        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/my-loans" element={<ProtectedRoute roles={['STUDENT']}><MyLoans /></ProtectedRoute>} />
      </Route>

      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
