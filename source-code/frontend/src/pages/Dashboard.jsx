import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { reportsApi, loansApi } from '../api/services';
import { fmtDate, STATUS_LABEL } from '../utils/format';
import { IconBook, IconUsers, IconSwap, IconBell } from '../components/Icons';

const fmt = (n) => (n ?? 0).toLocaleString('vi-VN');
const loanCode = (id) => `PH-${String(id).padStart(4, '0')}`;

const STATUS_COLORS = {
  PENDING: '#e0a458', BORROWED: '#e0744e', OVERDUE: '#c0392b',
  RETURNED: '#1f3a5a', REJECTED: '#b8b2aa',
};

// Sparkline nhỏ trong thẻ KPI.
function Spark({ data, color }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sp-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sp-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [week, setWeek] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [top, setTop] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [recent, setRecent] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    reportsApi.dashboard().then(setStats).catch((e) => setErr(e.message));
    reportsApi.borrowReturn7days().then(setWeek).catch(() => {});
    reportsApi.loansByStatus().then(setByStatus).catch(() => {});
    reportsApi.booksByCategory().then(setByCategory).catch(() => {});
    reportsApi.topBooks(4).then(setTop).catch(() => {});
    loansApi.overdue().then(setOverdue).catch(() => {});
    loansApi.all().then((d) => setRecent(d.slice(0, 5))).catch(() => {});
  }, []);

  if (err) return <div className="alert error">{err}</div>;
  if (!stats) return <p>Đang tải...</p>;

  const spark = week.map((d) => ({ v: d.borrowed }));
  const sparkR = week.map((d) => ({ v: d.returned }));

  const kpis = [
    { tone: 'peach', icon: IconBook, label: 'Tổng số sách', value: stats.totalBooks, sub: `${fmt(stats.totalCopies)} bản sao`, color: '#e0744e', data: spark },
    { tone: 'blue', icon: IconUsers, label: 'Độc giả / Người dùng', value: stats.totalUsers, sub: 'tài khoản', color: '#1f3a5a', data: sparkR },
    { tone: 'peach', icon: IconSwap, label: 'Sách đang cho mượn', value: stats.borrowed, sub: `${fmt(stats.pending)} chờ duyệt`, color: '#e0744e', data: spark },
    { tone: 'red', icon: IconBell, label: 'Sách quá hạn / Chưa trả', value: stats.overdue, sub: 'cần nhắc nhở', color: '#c0392b', data: sparkR },
  ];

  const weekData = week.map((d) => ({ name: d.label, Mượn: d.borrowed, Trả: d.returned }));
  const statusData = byStatus.filter((s) => s.count > 0)
    .map((s) => ({ name: STATUS_LABEL[s.status] || s.status, key: s.status, value: s.count }));
  const catData = byCategory.map((c) => ({ name: c.category, 'Số sách': c.count }));

  const activityText = (l) => {
    const who = l.user?.fullName || 'Độc giả';
    const book = l.book?.title || 'sách';
    if (l.status === 'RETURNED') return `${who} đã trả "${book}"`;
    if (l.status === 'BORROWED' || l.status === 'OVERDUE') return `${who} đang mượn "${book}"`;
    if (l.status === 'REJECTED') return `Từ chối yêu cầu mượn "${book}" của ${who}`;
    return `${who} gửi yêu cầu mượn "${book}"`;
  };
  const remind = (l) => alert(`Đã gửi nhắc nhở tới "${l.user?.fullName}" về sách "${l.book?.title}".`);

  return (
    <div className="libra">
      <div className="lb-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="lb-sub">Tổng quan hoạt động Thư viện Mini</p>
        </div>
      </div>

      {/* KPI */}
      <div className="lb-kpis">
        {kpis.map((k) => (
          <div key={k.label} className={`lb-kpi ${k.tone}`}>
            <div className="lb-kpi-row">
              <div className="lb-kpi-ic"><k.icon /></div>
              <div className="lb-kpi-meta">
                <span className="lb-kpi-label">{k.label}</span>
                <span className="lb-kpi-val">{fmt(k.value)}</span>
              </div>
            </div>
            <div className="lb-kpi-foot">
              <span className="lb-kpi-sub">{k.sub}</span>
            </div>
            <div className="lb-kpi-spark"><Spark data={k.data} color={k.color} /></div>
          </div>
        ))}
      </div>

      {/* Hàng 1: biểu đồ chính + donut trạng thái */}
      <div className="lb-row r-2-1">
        <div className="lb-card">
          <div className="lb-card-head"><h3>Lượt Mượn &amp; Trả Sách</h3><span className="lb-pill">7 ngày gần nhất</span></div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weekData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gMuon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e0744e" stopOpacity={0.35} /><stop offset="100%" stopColor="#e0744e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gTra" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1f3a5a" stopOpacity={0.3} /><stop offset="100%" stopColor="#1f3a5a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip /><Legend />
              <Area type="monotone" dataKey="Mượn" stroke="#e0744e" strokeWidth={2.5} fill="url(#gMuon)" />
              <Area type="monotone" dataKey="Trả" stroke="#1f3a5a" strokeWidth={2.5} fill="url(#gTra)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lb-card">
          <div className="lb-card-head"><h3>Trạng thái phiếu mượn</h3></div>
          {statusData.length === 0 ? <p className="muted">Chưa có phiếu mượn.</p> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                     innerRadius={55} outerRadius={90} paddingAngle={2}
                     label={(e) => `${e.value}`} labelLine={false} fontSize={12}>
                  {statusData.map((e) => <Cell key={e.key} fill={STATUS_COLORS[e.key] || '#ccc'} />)}
                </Pie>
                <Tooltip /><Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Hàng 2: sách theo thể loại + top sách */}
      <div className="lb-row r-1-1">
        <div className="lb-card">
          <div className="lb-card-head"><h3>Số đầu sách theo thể loại</h3></div>
          {catData.length === 0 ? <p className="muted">Chưa có thể loại.</p> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart layout="vertical" data={catData} margin={{ top: 4, right: 16, left: 24, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                <XAxis type="number" allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={90} />
                <Tooltip />
                <Bar dataKey="Số sách" fill="#e0744e" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lb-card">
          <div className="lb-card-head"><h3>Top sách được mượn nhiều</h3></div>
          <ul className="lb-top">
            {top.map((t, i) => (
              <li key={t.bookId}>
                <span className={`lb-rank r${i + 1}`}>{i + 1}</span>
                <span className="lb-top-title">{t.title}</span>
                <span className="lb-top-count">{t.borrowCount} lượt</span>
              </li>
            ))}
            {top.length === 0 && <li className="muted">Chưa có dữ liệu mượn.</li>}
          </ul>
        </div>
      </div>

      {/* Hàng 3: bảng quá hạn + hoạt động gần đây */}
      <div className="lb-row r-2-1">
        <div className="lb-card">
          <div className="lb-card-head">
            <h3 className="danger-title">⚠️ Sách quá hạn trả</h3>
            <span className="lb-pill danger">{overdue.length} phiếu</span>
          </div>
          <table className="table lb-table">
            <thead>
              <tr><th>Mã phiếu</th><th>Tên sách</th><th>Độc giả</th><th>Ngày phải trả</th><th>Trễ</th><th>Phí phạt</th><th></th></tr>
            </thead>
            <tbody>
              {overdue.map((l) => (
                <tr key={l.id}>
                  <td>{loanCode(l.id)}</td>
                  <td>{l.book?.title}</td>
                  <td>{l.user?.fullName}</td>
                  <td>{fmtDate(l.dueDate)}</td>
                  <td><span className="badge danger">{l.overdueDays} ngày</span></td>
                  <td>{fmt(l.estimatedFine)}đ</td>
                  <td><button className="btn-coral" onClick={() => remind(l)}>Gửi nhắc nhở</button></td>
                </tr>
              ))}
              {overdue.length === 0 && <tr><td colSpan="7" className="muted">Không có sách quá hạn. 🎉</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="lb-card">
          <div className="lb-card-head"><h3>Hoạt động gần đây</h3></div>
          <ul className="lb-activity">
            {recent.map((l) => (
              <li key={l.id}>
                <span className={`lb-dot ${l.status}`} />
                <div>
                  <p>{activityText(l)}</p>
                  <span className="lb-time">{fmtDate(l.requestedAt)} · {STATUS_LABEL[l.status]}</span>
                </div>
              </li>
            ))}
            {recent.length === 0 && <li className="muted">Chưa có hoạt động.</li>}
          </ul>
          <button className="lb-link" onClick={() => navigate('/manage/loans')}>Xem tất cả →</button>
        </div>
      </div>
    </div>
  );
}
