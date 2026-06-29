import { useEffect, useState } from 'react';
import { loansApi } from '../api/services';
import { STATUS_LABEL, STATUS_CLASS, fmtDate, fmtMoney } from '../utils/format';

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [err, setErr] = useState('');

  const load = () => loansApi.my().then(setLoans).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const renew = async (id) => {
    setErr('');
    try {
      await loansApi.renew(id);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Phiếu mượn của tôi</h1>
      {err && <div className="alert error">{err}</div>}
      <table className="table">
        <thead>
          <tr><th>Sách</th><th>Trạng thái</th><th>Ngày mượn</th><th>Hạn trả</th><th>Gia hạn</th><th>Phí phạt</th><th></th></tr>
        </thead>
        <tbody>
          {loans.map((l) => (
            <tr key={l.id}>
              <td>{l.book?.title}</td>
              <td><span className={STATUS_CLASS[l.status]}>{STATUS_LABEL[l.status]}</span></td>
              <td>{fmtDate(l.borrowedAt)}</td>
              <td>{fmtDate(l.dueDate)}</td>
              <td>{l.renewalCount}/2</td>
              <td>{fmtMoney(l.fineAmount)}</td>
              <td>
                {l.status === 'BORROWED' && (
                  <button className="btn btn-sm" onClick={() => renew(l.id)}>Gia hạn</button>
                )}
              </td>
            </tr>
          ))}
          {loans.length === 0 && <tr><td colSpan="7" className="muted">Chưa có phiếu mượn nào.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
