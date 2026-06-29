import { useEffect, useState } from 'react';
import { usersApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

const ROLES = ['STUDENT', 'LIBRARIAN', 'ADMIN'];
const ROLE_LABEL = { STUDENT: 'Sinh viên', LIBRARIAN: 'Thủ thư', ADMIN: 'Quản trị viên' };

export default function ManageUsers() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STUDENT' });

  const load = () => usersApi.list({ q }).then(setUsers).catch((e) => setErr(e.message));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const act = async (fn) => {
    setErr('');
    try { await fn(); load(); } catch (e) { setErr(e.message); }
  };

  const create = async (e) => {
    e.preventDefault();
    await act(async () => {
      await usersApi.create(form);
      setForm({ fullName: '', email: '', password: '', role: 'STUDENT' });
    });
  };

  return (
    <div className="container">
      <h1 className="page-title">Quản lý Độc giả / Người dùng</h1>
      {err && <div className="alert error">{err}</div>}

      {isAdmin && (
        <form className="card form-grid" onSubmit={create}>
          <h3>Tạo tài khoản</h3>
          <input placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Mật khẩu" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
          <button className="btn btn-primary">Tạo</button>
        </form>
      )}

      <div className="filters">
        <input placeholder="Tìm theo tên/email..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary" onClick={load}>Tìm</button>
      </div>

      <table className="table">
        <thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>
                {isAdmin ? (
                  <select value={u.role} onChange={(e) => act(() => usersApi.setRole(u.id, e.target.value))}>
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </select>
                ) : ROLE_LABEL[u.role]}
              </td>
              <td><span className={u.active ? 'badge ok' : 'badge danger'}>{u.active ? 'Hoạt động' : 'Bị khóa'}</span></td>
              <td>
                {isAdmin ? (
                  <button className="btn btn-sm" onClick={() => act(() => usersApi.setStatus(u.id, !u.active))}>
                    {u.active ? 'Khóa' : 'Mở khóa'}
                  </button>
                ) : <span className="muted">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
