import { useEffect, useState } from 'react'; // Hook side-effect và state
import { settingsApi } from '../api/services'; // API cấu hình hệ thống

const FIELDS = [ // Khai báo các trường cấu hình hiển thị trên form
  { key: 'max_books', label: 'Số sách mượn tối đa / người', hint: 'BR-01' }, // Hạn mức mượn
  { key: 'loan_days', label: 'Số ngày mượn mặc định', hint: 'BR-02' }, // Số ngày cho mượn
  { key: 'renew_days', label: 'Số ngày gia hạn mỗi lần', hint: 'BR-03' }, // Số ngày gia hạn
  { key: 'max_renewals', label: 'Số lần gia hạn tối đa', hint: 'BR-03' }, // Số lần gia hạn
  { key: 'fine_per_day', label: 'Phí phạt / ngày trễ (đ)', hint: 'BR-07' }, // Phí phạt mỗi ngày
]; // Kết thúc FIELDS

export default function Settings() { // Trang cài đặt hệ thống (chỉ admin)
  const [cfg, setCfg] = useState(null); // State cấu hình hiện tại (null = chưa tải)
  const [msg, setMsg] = useState(''); // State thông báo thành công
  const [err, setErr] = useState(''); // State lỗi

  useEffect(() => { // Khi vào trang
    settingsApi.get().then(setCfg).catch((e) => setErr(e.message)); // Tải cấu hình hiện tại
  }, []); // Chỉ chạy 1 lần

  const save = async (e) => { // Hàm lưu cấu hình
    e.preventDefault(); // Ngăn reload trang
    setMsg(''); setErr(''); // Xóa thông báo cũ
    try { // Thử lưu
      const patch = {}; // Object chứa các giá trị cần cập nhật
      FIELDS.forEach((f) => { patch[f.key] = Number(cfg[f.key]); }); // Ép mỗi trường về số
      const updated = await settingsApi.update(patch); // Gọi API cập nhật
      setCfg(updated); // Cập nhật state với cấu hình mới trả về
      setMsg('Đã lưu cấu hình hệ thống.'); // Báo thành công
    } catch (e2) { // Nếu lỗi
      setErr(e2.message); // Hiển thị lỗi
    } // Kết thúc try
  }; // Kết thúc save

  if (err && !cfg) return <div className="alert error">{err}</div>; // Lỗi khi tải -> chỉ hiện lỗi
  if (!cfg) return <p>Đang tải...</p>; // Chưa có cấu hình -> màn chờ

  return ( // Giao diện
    <div> {/* Khung trang */}
      <h1 className="page-title">Cài đặt hệ thống</h1> {/* Tiêu đề */}
      <div className="panel" style={{ maxWidth: 560 }}> {/* Khung form, giới hạn bề rộng */}
        <h3>Tham số nghiệp vụ mượn — trả</h3> {/* Tiêu đề nhóm */}
        {msg && <div className="alert ok">{msg}</div>} {/* Ô thông báo thành công */}
        {err && <div className="alert error">{err}</div>} {/* Ô lỗi */}
        <form onSubmit={save}> {/* Form cấu hình */}
          {FIELDS.map((f) => ( // Duyệt từng trường cấu hình
            <div key={f.key}> {/* Khối một trường */}
              <label>{f.label} <span className="muted">({f.hint})</span></label> {/* Nhãn + mã quy tắc nghiệp vụ */}
              <input
                type="number" min="0" // Ô nhập số, không âm
                value={cfg[f.key]} // Giá trị hiện tại của trường
                onChange={(e) => setCfg({ ...cfg, [f.key]: e.target.value })} // Cập nhật cấu hình khi gõ
              /> {/* Kết thúc ô nhập */}
            </div> // Kết thúc khối trường
          ))} {/* Kết thúc map trường */}
          <button className="btn btn-primary" style={{ marginTop: 14 }}>Lưu cấu hình</button> {/* Nút lưu */}
        </form> {/* Kết thúc form */}
      </div> {/* Kết thúc panel */}
    </div> // Kết thúc khung
  ); // Kết thúc return
} // Kết thúc Settings
