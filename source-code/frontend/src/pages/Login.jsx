import { useState } from 'react'; // Hook quản lý state
import { useNavigate, Link } from 'react-router-dom'; // Hook chuyển trang và component liên kết
import { useAuth } from '../context/AuthContext'; // Hook đăng nhập
import { Logo } from '../components/Icons'; // Logo ứng dụng
import ThemeToggle from '../components/ThemeToggle'; // Nút đổi giao diện

export default function Login() { // Trang đăng nhập
  const { login } = useAuth(); // Lấy hàm đăng nhập từ context
  const navigate = useNavigate(); // Hàm chuyển trang
  const [email, setEmail] = useState('student@lib.edu.vn'); // State email (điền sẵn tài khoản mẫu cho tiện thử)
  const [password, setPassword] = useState('Pass@123'); // State mật khẩu (điền sẵn)
  const [error, setError] = useState(''); // State thông báo lỗi
  const [loading, setLoading] = useState(false); // State đang xử lý đăng nhập

  const submit = async (e) => { // Hàm xử lý khi gửi form
    e.preventDefault(); // Ngăn reload trang
    setError(''); // Xóa lỗi cũ
    setLoading(true); // Bật trạng thái đang xử lý
    try { // Thử đăng nhập
      await login(email, password); // Gọi hàm đăng nhập
      navigate('/'); // Thành công -> về trang gốc (sẽ tự điều hướng theo vai trò)
    } catch (err) { // Nếu lỗi
      setError(err.message); // Hiển thị thông điệp lỗi
    } finally { // Dù sao
      setLoading(false); // Tắt trạng thái đang xử lý
    } // Kết thúc try/catch
  }; // Kết thúc submit

  return ( // Giao diện
    <div className="auth-wrap"> {/* Khung bao trang đăng nhập */}
      <ThemeToggle floating /> {/* Nút đổi giao diện kiểu nổi (góc màn hình) */}
      <div className="auth-brand"><Logo /> MiniLib</div> {/* Logo + tên */}
      <div className="card auth-card"> {/* Thẻ form */}
        <h2>Đăng nhập</h2> {/* Tiêu đề */}
        {error && <div className="alert error">{error}</div>} {/* Hiện ô lỗi nếu có */}
        <form onSubmit={submit}> {/* Form đăng nhập */}
          <label>Email</label> {/* Nhãn email */}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /> {/* Ô nhập email */}
          <label>Mật khẩu</label> {/* Nhãn mật khẩu */}
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /> {/* Ô nhập mật khẩu (ẩn ký tự) */}
          <button className="btn btn-primary" disabled={loading}> {/* Nút gửi, khóa khi đang xử lý */}
            {loading ? 'Đang xử lý...' : 'Đăng nhập'} {/* Đổi chữ theo trạng thái */}
          </button> {/* Kết thúc nút */}
        </form> {/* Kết thúc form */}
        <p className="muted">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p> {/* Liên kết sang trang đăng ký */}
        <div className="hint"> {/* Gợi ý tài khoản mẫu */}
          <b>Tài khoản mẫu</b> (mật khẩu: Pass@123):<br /> {/* Tiêu đề gợi ý */}
          admin@lib.edu.vn · librarian@lib.edu.vn · student@lib.edu.vn {/* Danh sách email mẫu */}
        </div> {/* Kết thúc hint */}
      </div> {/* Kết thúc card */}
    </div> // Kết thúc auth-wrap
  ); // Kết thúc return
} // Kết thúc Login
