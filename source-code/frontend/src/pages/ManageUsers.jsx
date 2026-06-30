import { useEffect, useState } from 'react'; // Hook side-effect và state
import { usersApi } from '../api/services'; // API người dùng
import { useAuth } from '../context/AuthContext'; // Hook lấy thông tin đăng nhập

const ROLES = ['STUDENT', 'LIBRARIAN', 'ADMIN']; // Danh sách vai trò hợp lệ
const ROLE_LABEL = { STUDENT: 'Sinh viên', LIBRARIAN: 'Thủ thư', ADMIN: 'Quản trị viên' }; // Map vai trò -> nhãn tiếng Việt

export default function ManageUsers() { // Trang quản lý người dùng
  const { user } = useAuth(); // Lấy user hiện tại
  const isAdmin = user?.role === 'ADMIN'; // Cờ: có phải admin không (admin mới được tạo/sửa)
  const [users, setUsers] = useState([]); // State danh sách người dùng
  const [q, setQ] = useState(''); // State từ khóa tìm kiếm
  const [err, setErr] = useState(''); // State lỗi
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STUDENT' }); // State form tạo tài khoản

  const load = () => usersApi.list({ q }).then(setUsers).catch((e) => setErr(e.message)); // Tải danh sách theo từ khóa
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []); // Tải khi vào trang

  const act = async (fn) => { // Hàm bọc thực thi thao tác rồi tải lại
    setErr(''); // Xóa lỗi
    try { await fn(); load(); } catch (e) { setErr(e.message); } // Chạy thao tác; thành công thì refresh, lỗi thì hiển thị
  }; // Kết thúc act

  const create = async (e) => { // Hàm tạo tài khoản
    e.preventDefault(); // Ngăn reload trang
    await act(async () => { // Dùng act để chạy và refresh
      await usersApi.create(form); // Gọi API tạo user
      setForm({ fullName: '', email: '', password: '', role: 'STUDENT' }); // Reset form sau khi tạo
    }); // Kết thúc act
  }; // Kết thúc create

  return ( // Giao diện
    <div className="container"> {/* Khung trang */}
      <h1 className="page-title">Quản lý Độc giả / Người dùng</h1> {/* Tiêu đề */}
      {err && <div className="alert error">{err}</div>} {/* Ô lỗi nếu có */}

      {isAdmin && ( // Chỉ admin thấy form tạo tài khoản
        <form className="card form-grid" onSubmit={create}> {/* Form tạo tài khoản */}
          <h3>Tạo tài khoản</h3> {/* Tiêu đề form */}
          <input placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /> {/* Ô họ tên */}
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /> {/* Ô email */}
          <input placeholder="Mật khẩu" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /> {/* Ô mật khẩu */}
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}> {/* Chọn vai trò */}
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)} {/* Liệt kê vai trò */}
          </select> {/* Kết thúc select */}
          <button className="btn btn-primary">Tạo</button> {/* Nút tạo */}
        </form> // Kết thúc form
      )} {/* Kết thúc điều kiện admin */}

      <div className="filters"> {/* Khu vực tìm kiếm */}
        <input placeholder="Tìm theo tên/email..." value={q} onChange={(e) => setQ(e.target.value)} /> {/* Ô tìm kiếm */}
        <button className="btn btn-primary" onClick={load}>Tìm</button> {/* Nút tìm */}
      </div> {/* Kết thúc filters */}

      <table className="table"> {/* Bảng người dùng */}
        <thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead> {/* Tiêu đề bảng */}
        <tbody> {/* Thân bảng */}
          {users.map((u) => ( // Duyệt từng user
            <tr key={u.id}> {/* Một dòng user */}
              <td>{u.fullName}</td> {/* Họ tên */}
              <td>{u.email}</td> {/* Email */}
              <td> {/* Cột vai trò */}
                {isAdmin ? ( // Admin được đổi vai trò bằng dropdown
                  <select value={u.role} onChange={(e) => act(() => usersApi.setRole(u.id, e.target.value))}> {/* Đổi vai trò ngay khi chọn */}
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)} {/* Liệt kê vai trò */}
                  </select> // Kết thúc select
                ) : ROLE_LABEL[u.role]} {/* Không phải admin thì chỉ hiển thị chữ */}
              </td> {/* Kết thúc cột vai trò */}
              <td><span className={u.active ? 'badge ok' : 'badge danger'}>{u.active ? 'Hoạt động' : 'Bị khóa'}</span></td> {/* Trạng thái có màu */}
              <td> {/* Cột thao tác */}
                {isAdmin ? ( // Admin được khóa/mở khóa
                  <button className="btn btn-sm" onClick={() => act(() => usersApi.setStatus(u.id, !u.active))}> {/* Đảo trạng thái khóa */}
                    {u.active ? 'Khóa' : 'Mở khóa'} {/* Đổi chữ theo trạng thái hiện tại */}
                  </button> // Kết thúc nút
                ) : <span className="muted">—</span>} {/* Không phải admin thì để gạch ngang */}
              </td> {/* Kết thúc cột thao tác */}
            </tr> // Kết thúc dòng
          ))} {/* Kết thúc map user */}
        </tbody> {/* Kết thúc tbody */}
      </table> {/* Kết thúc bảng */}
    </div> // Kết thúc container
  ); // Kết thúc return
} // Kết thúc ManageUsers
