import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { reportsApi } from '../api/services';
import { STATUS_LABEL } from '../utils/format';

const PIE_COLORS = {
  PENDING: '#f59e0b', BORROWED: '#2563eb', OVERDUE: '#dc2626',
  RETURNED: '#16a34a', REJECTED: '#9ca3af',
};

export default function Reports() {
  const [top, setTop] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [byPeriod, setByPeriod] = useState([]);

  useEffect(() => {
    reportsApi.topBooks(5).then(setTop).catch(() => {});
    reportsApi.loansByStatus().then(setByStatus).catch(() => {});
    reportsApi.booksByCategory().then(setByCategory).catch(() => {});
    reportsApi.loansByPeriod().then(setByPeriod).catch(() => {});
  }, []);

  const statusData = byStatus
    .filter((s) => s.count > 0)
    .map((s) => ({ name: STATUS_LABEL[s.status] || s.status, key: s.status, value: s.count }));
  const topData = top.map((t) => ({ name: t.title.length > 18 ? t.title.slice(0, 16) + '…' : t.title, 'Lượt mượn': t.borrowCount }));
  const categoryData = byCategory.map((c) => ({ name: c.category, 'Số sách': c.count }));
  const periodData = byPeriod.map((p) => ({ name: p.date.slice(5), 'Lượt mượn': p.count }));

  const exportCsv = (type) => {
    const token = localStorage.getItem('token');
    fetch(`/api/reports/export?type=${type}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((b) => {
        const url = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = url; a.download = `report-${type}.csv`; a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert('Xuất CSV cần quyền Quản trị viên.'));
  };

  return (
    <div>
      <h1 className="page-title">Báo cáo &amp; Thống kê</h1>
      <div className="export-bar">
        <button className="btn" onClick={() => exportCsv('loans')}>⬇ Xuất CSV phiếu mượn</button>
        <button className="btn" onClick={() => exportCsv('books')}>⬇ Xuất CSV danh mục sách</button>
      </div>

      <div className="chart-grid">
        <div className="panel">
          <h3>Top sách được mượn nhiều</h3>
          {topData.length === 0 ? <p className="muted">Chưa có dữ liệu mượn.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={11} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="Lượt mượn" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel">
          <h3>Phân bố trạng thái phiếu mượn</h3>
          {statusData.length === 0 ? <p className="muted">Chưa có phiếu mượn.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                     outerRadius={90} label={(e) => `${e.name}: ${e.value}`} labelLine={false} fontSize={11}>
                  {statusData.map((entry) => <Cell key={entry.key} fill={PIE_COLORS[entry.key] || '#8884d8'} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel">
          <h3>Số đầu sách theo thể loại</h3>
          {categoryData.length === 0 ? <p className="muted">Chưa có thể loại.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={11} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="Số sách" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel">
          <h3>Lượt mượn theo ngày</h3>
          {periodData.length === 0 ? <p className="muted">Chưa có dữ liệu theo thời gian.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={periodData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip /><Legend />
                <Line type="monotone" dataKey="Lượt mượn" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
