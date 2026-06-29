import { useEffect, useState } from 'react';
import { settingsApi } from '../api/services';

const FIELDS = [
  { key: 'max_books', label: 'Số sách mượn tối đa / người', hint: 'BR-01' },
  { key: 'loan_days', label: 'Số ngày mượn mặc định', hint: 'BR-02' },
  { key: 'renew_days', label: 'Số ngày gia hạn mỗi lần', hint: 'BR-03' },
  { key: 'max_renewals', label: 'Số lần gia hạn tối đa', hint: 'BR-03' },
  { key: 'fine_per_day', label: 'Phí phạt / ngày trễ (đ)', hint: 'BR-07' },
];

export default function Settings() {
  const [cfg, setCfg] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    settingsApi.get().then(setCfg).catch((e) => setErr(e.message));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const patch = {};
      FIELDS.forEach((f) => { patch[f.key] = Number(cfg[f.key]); });
      const updated = await settingsApi.update(patch);
      setCfg(updated);
      setMsg('Đã lưu cấu hình hệ thống.');
    } catch (e2) {
      setErr(e2.message);
    }
  };

  if (err && !cfg) return <div className="alert error">{err}</div>;
  if (!cfg) return <p>Đang tải...</p>;

  return (
    <div>
      <h1 className="page-title">Cài đặt hệ thống</h1>
      <div className="panel" style={{ maxWidth: 560 }}>
        <h3>Tham số nghiệp vụ mượn — trả</h3>
        {msg && <div className="alert ok">{msg}</div>}
        {err && <div className="alert error">{err}</div>}
        <form onSubmit={save}>
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label>{f.label} <span className="muted">({f.hint})</span></label>
              <input
                type="number" min="0"
                value={cfg[f.key]}
                onChange={(e) => setCfg({ ...cfg, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <button className="btn btn-primary" style={{ marginTop: 14 }}>Lưu cấu hình</button>
        </form>
      </div>
    </div>
  );
}
