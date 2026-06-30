import { useState } from 'react'; // Hook quản lý state
import { useNavigate, Link } from 'react-router-dom'; // Hook chuyển trang và component liên kết
import { authApi } from '../api/services'; // API xác thực (đăng ký)
import { useAuth } from '../context/AuthContext'; // Hook đăng nhập (để tự đăng nhập sau khi đăng ký)
import { Logo } from '../components/Icons'; // Logo ứng dụng
import ThemeToggle from '../components/ThemeToggle'; // Nút đổi giao diện

export default function Register() { // Trang đăng ký
  const navigate = useNavigate(); // Hàm chuyển trang
  const { login } = useAuth(); // Hàm đăng nhập
  const [form, setForm] = useState({ fullName: '', email: '', password: '' }); // State gom các trường của form
  const [error, setError] = useState(''); // State lỗi
  const [loading, setLoading] = useState(false); // State đang xử lý

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value }); // Cập nhật đúng trường theo thuộc tính name của ô nhập

  const submit = async (e) => { // Hàm xử lý gửi form
    e.preventDefault(); // Ngăn reload trang
    setError(''); // Xóa lỗi cũ
    setLoading(true); // Bật trạng thái đang xử lý
    try { // Thử đăng ký
      await authApi.register(form); // Gọi API tạo tài khoản
      await login(form.email, form.password); // Đăng nhập luôn bằng tài khoản vừa tạo
      navigate('/'); // Về trang gốc
    } catch (err) { // Nếu lỗi
      setError(err.message); // Hiển thị lỗi
    } finally { // Dù sao
      setLoading(false); // Tắt trạng thái đang xử lý
    } // Kết thúc try/catch
  }; // Kết thúc submit

  return ( // Giao diện
    <div className="auth-wrap"> {/* Khung bao trang */}
      <ThemeToggle floating /> {/* Nút đổi giao diện kiểu nổi */}
      <div className="auth-brand"><Logo /> MiniLib</div> {/* Logo + tên */}
      <div className="card auth-card"> {/* Thẻ form */}
        <h2>Đăng ký tài khoản</h2> {/* Tiêu đề */}
        {error && <div className="alert error">{error}</div>} {/* Ô lỗi nếu có */}
        <form onSubmit={submit}> {/* Form đăng ký */}
          <label>Họ tên</label> {/* Nhãn họ tên */}
          <input name="fullName" value={form.fullName} onChange={onChange} required /> {/* Ô nhập họ tên */}
          <label>Email</label> {/* Nhãn email */}
          <input name="email" value={form.email} onChange={onChange} type="email" required /> {/* Ô nhập email */}
          <label>Mật khẩu (≥ 6 ký tự)</label> {/* Nhãn mật khẩu */}
          <input name="password" value={form.password} onChange={onChange} type="password" minLength={6} required /> {/* Ô mật khẩu, tối thiểu 6 ký tự */}
          <button className="btn btn-primary" disabled={loading}> {/* Nút gửi, khóa khi đang xử lý */}
            {loading ? 'Đang xử lý...' : 'Đăng ký'} {/* Đổi chữ theo trạng thái */}
          </button> {/* Kết thúc nút */}
        </form> {/* Kết thúc form */}
        <p className="muted">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p> {/* Liên kết sang trang đăng nhập */}
      </div> {/* Kết thúc card */}
    </div> // Kết thúc auth-wrap
  ); // Kết thúc return
} // Kết thúc Register
