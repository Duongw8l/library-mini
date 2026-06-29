import { useEffect, useState } from 'react';
import { loansApi } from '../api/services';
import { STATUS_LABEL, STATUS_CLASS, fmtDate, fmtMoney } from '../utils/format';

const TABS = ['PENDING', 'BORROWED', 'OVERDUE', 'RETURNED', 'REJECTED'];

export default function ManageLoans() {
  const [tab, setTab] = useState('PENDING');
  const [loans, setLoans] = useState([]);
  const [err, setErr] = useState('');

  const load = (status = tab) => {
    setErr('');
    loansApi.all(status).then(setLoans).catch((e) => setErr(e.message));
  };
  useEffect(() => { load(tab); /* eslint-disable-next-line */ }, [tab]);

  const act = async (fn) => {
    setErr('');
    try { await fn(); load(); } catch (e) { setErr(e.message); }
  };

  return (
    <div className="container">
      <h1 className="page-title">Duyệt mượn — Trả sách</h1>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {STATUS_LABEL[t]}
          </button>
        ))}
      </div>
      {err && <div className="alert error">{err}</div>}
      <table className="table">
        <thead>
          <tr><th>Sách</th><th>Người mượn</th><th>Trạng thái</th><th>Hạn trả</th><th>Phí phạt</th><th>Thao tác</th></tr>
        </thead>
        <tbody>
          {loans.map((l) => (
            <tr key={l.id}>
              <td>{l.book?.title}</td>
              <td>{l.user?.fullName}</td>
              <td><span className={STATUS_CLASS[l.status]}>{STATUS_LABEL[l.status]}</span></td>
              <td>{fmtDate(l.dueDate)}</td>
              <td>{fmtMoney(l.fineAmount)}</td>
              <td className="actions">
                {l.status === 'PENDING' && (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => act(() => loansApi.approve(l.id))}>Duyệt</button>
                    <button className="btn btn-sm" onClick={() => act(() => loansApi.reject(l.id, prompt('Lý do từ chối:') || 'Không rõ'))}>Từ chối</button>
                  </>
                )}
                {(l.status === 'BORROWED' || l.status === 'OVERDUE') && (
                  <button className="btn btn-sm btn-primary" onClick={() => act(() => loansApi.returnBook(l.id))}>Xác nhận trả</button>
                )}
              </td>
            </tr>
          ))}
          {loans.length === 0 && <tr><td colSpan="6" className="muted">Không có phiếu nào.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
