import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Icons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('student@lib.edu.vn');
  const [password, setPassword] = useState('Pass@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-brand"><Logo /> MiniLib</div>
      <div className="card auth-card">
        <h2>Đăng nhập</h2>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <label>Mật khẩu</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
        <p className="muted">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
        <div className="hint">
          <b>Tài khoản mẫu</b> (mật khẩu: Pass@123):<br />
          admin@lib.edu.vn · librarian@lib.edu.vn · student@lib.edu.vn
        </div>
      </div>
    </div>
  );
}
