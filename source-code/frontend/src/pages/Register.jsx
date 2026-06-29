import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Icons';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(form);
      await login(form.email, form.password);
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
        <h2>Đăng ký tài khoản</h2>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit}>
          <label>Họ tên</label>
          <input name="fullName" value={form.fullName} onChange={onChange} required />
          <label>Email</label>
          <input name="email" value={form.email} onChange={onChange} type="email" required />
          <label>Mật khẩu (≥ 6 ký tự)</label>
          <input name="password" value={form.password} onChange={onChange} type="password" minLength={6} required />
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>
        <p className="muted">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </div>
    </div>
  );
}
