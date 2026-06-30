import { useEffect, useState } from 'react'; // Hook side-effect và state
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'; // Các thành phần vẽ biểu đồ
import { reportsApi } from '../api/services'; // API báo cáo
import { STATUS_LABEL } from '../utils/format'; // Nhãn trạng thái tiếng Việt

const PIE_COLORS = { // Màu cho từng trạng thái trong biểu đồ tròn
  PENDING: '#f59e0b', BORROWED: '#2563eb', OVERDUE: '#dc2626', // Chờ / đang mượn / quá hạn
  RETURNED: '#16a34a', REJECTED: '#9ca3af', // Đã trả / bị từ chối
}; // Kết thúc PIE_COLORS

export default function Reports() { // Trang báo cáo & thống kê
  const [top, setTop] = useState([]); // State top sách mượn nhiều
  const [byStatus, setByStatus] = useState([]); // State phân bố theo trạng thái
  const [byCategory, setByCategory] = useState([]); // State số sách theo thể loại
  const [byPeriod, setByPeriod] = useState([]); // State lượt mượn theo ngày

  useEffect(() => { // Khi vào trang: tải song song các báo cáo
    reportsApi.topBooks(5).then(setTop).catch(() => {}); // Top 5 sách
    reportsApi.loansByStatus().then(setByStatus).catch(() => {}); // Theo trạng thái
    reportsApi.booksByCategory().then(setByCategory).catch(() => {}); // Theo thể loại
    reportsApi.loansByPeriod().then(setByPeriod).catch(() => {}); // Theo thời gian
  }, []); // Chỉ chạy 1 lần

  const statusData = byStatus
    .filter((s) => s.count > 0) // Bỏ trạng thái 0 phiếu
    .map((s) => ({ name: STATUS_LABEL[s.status] || s.status, key: s.status, value: s.count })); // Chuẩn hóa cho biểu đồ tròn
  const topData = top.map((t) => ({ name: t.title.length > 18 ? t.title.slice(0, 16) + '…' : t.title, 'Lượt mượn': t.borrowCount })); // Rút gọn tên sách dài và gắn số lượt
  const categoryData = byCategory.map((c) => ({ name: c.category, 'Số sách': c.count })); // Chuẩn hóa cho biểu đồ cột thể loại
  const periodData = byPeriod.map((p) => ({ name: p.date.slice(5), 'Lượt mượn': p.count })); // Lấy phần MM-DD của ngày và số lượt

  const exportCsv = (type) => { // Hàm tải file CSV báo cáo
    const token = localStorage.getItem('token'); // Lấy token để gửi kèm (endpoint cần quyền)
    fetch(`/api/reports/export?type=${type}`, { headers: { Authorization: `Bearer ${token}` } }) // Gọi API xuất CSV kèm token
      .then((r) => r.blob()) // Đọc phản hồi dạng nhị phân (blob)
      .then((b) => { // Khi có dữ liệu
        const url = URL.createObjectURL(b); // Tạo URL tạm cho blob
        const a = document.createElement('a'); // Tạo thẻ <a> ẩn để kích hoạt tải
        a.href = url; a.download = `report-${type}.csv`; a.click(); // Gán link, đặt tên file và bấm tải
        URL.revokeObjectURL(url); // Giải phóng URL tạm
      }) // Kết thúc xử lý blob
      .catch(() => alert('Xuất CSV cần quyền Quản trị viên.')); // Lỗi (vd không đủ quyền) -> báo
  }; // Kết thúc exportCsv

  return ( // Giao diện
    <div> {/* Khung trang */}
      <h1 className="page-title">Báo cáo &amp; Thống kê</h1> {/* Tiêu đề */}
      <div className="export-bar"> {/* Thanh nút xuất CSV */}
        <button className="btn" onClick={() => exportCsv('loans')}>⬇ Xuất CSV phiếu mượn</button> {/* Xuất phiếu mượn */}
        <button className="btn" onClick={() => exportCsv('books')}>⬇ Xuất CSV danh mục sách</button> {/* Xuất danh mục sách */}
      </div> {/* Kết thúc export-bar */}

      <div className="chart-grid"> {/* Lưới chứa các biểu đồ */}
        <div className="panel"> {/* Biểu đồ top sách */}
          <h3>Top sách được mượn nhiều</h3> {/* Tiêu đề */}
          {topData.length === 0 ? <p className="muted">Chưa có dữ liệu mượn.</p> : ( // Không có dữ liệu thì báo
            <ResponsiveContainer width="100%" height={260}> {/* Khung biểu đồ */}
              <BarChart data={topData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}> {/* Biểu đồ cột */}
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" /> {/* Lưới nền */}
                <XAxis dataKey="name" fontSize={11} interval={0} angle={-12} textAnchor="end" height={50} /> {/* Trục X: tên sách (nghiêng cho dễ đọc) */}
                <YAxis allowDecimals={false} fontSize={11} /> {/* Trục Y: số nguyên */}
                <Tooltip /> {/* Tooltip */}
                <Bar dataKey="Lượt mượn" fill="#2563eb" radius={[4, 4, 0, 0]} /> {/* Cột lượt mượn */}
              </BarChart> {/* Kết thúc BarChart */}
            </ResponsiveContainer> // Kết thúc container
          )} {/* Kết thúc nhánh dữ liệu */}
        </div> {/* Kết thúc panel top sách */}

        <div className="panel"> {/* Biểu đồ tròn trạng thái */}
          <h3>Phân bố trạng thái phiếu mượn</h3> {/* Tiêu đề */}
          {statusData.length === 0 ? <p className="muted">Chưa có phiếu mượn.</p> : ( // Không có thì báo
            <ResponsiveContainer width="100%" height={260}> {/* Khung biểu đồ */}
              <PieChart> {/* Biểu đồ tròn */}
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                     outerRadius={90} label={(e) => `${e.name}: ${e.value}`} labelLine={false} fontSize={11}> {/* Vòng tròn, nhãn tên + số */}
                  {statusData.map((entry) => <Cell key={entry.key} fill={PIE_COLORS[entry.key] || '#8884d8'} />)} {/* Tô màu từng phần theo trạng thái */}
                </Pie> {/* Kết thúc Pie */}
                <Tooltip /> {/* Tooltip */}
              </PieChart> {/* Kết thúc PieChart */}
            </ResponsiveContainer> // Kết thúc container
          )} {/* Kết thúc nhánh dữ liệu */}
        </div> {/* Kết thúc panel trạng thái */}

        <div className="panel"> {/* Biểu đồ thể loại */}
          <h3>Số đầu sách theo thể loại</h3> {/* Tiêu đề */}
          {categoryData.length === 0 ? <p className="muted">Chưa có thể loại.</p> : ( // Không có thì báo
            <ResponsiveContainer width="100%" height={260}> {/* Khung biểu đồ */}
              <BarChart data={categoryData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}> {/* Biểu đồ cột */}
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" /> {/* Lưới nền */}
                <XAxis dataKey="name" fontSize={11} interval={0} angle={-12} textAnchor="end" height={50} /> {/* Trục X: tên thể loại (nghiêng) */}
                <YAxis allowDecimals={false} fontSize={11} /> {/* Trục Y: số nguyên */}
                <Tooltip /> {/* Tooltip */}
                <Bar dataKey="Số sách" fill="#16a34a" radius={[4, 4, 0, 0]} /> {/* Cột số sách */}
              </BarChart> {/* Kết thúc BarChart */}
            </ResponsiveContainer> // Kết thúc container
          )} {/* Kết thúc nhánh dữ liệu */}
        </div> {/* Kết thúc panel thể loại */}

        <div className="panel"> {/* Biểu đồ đường theo ngày */}
          <h3>Lượt mượn theo ngày</h3> {/* Tiêu đề */}
          {periodData.length === 0 ? <p className="muted">Chưa có dữ liệu theo thời gian.</p> : ( // Không có thì báo
            <ResponsiveContainer width="100%" height={260}> {/* Khung biểu đồ */}
              <LineChart data={periodData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}> {/* Biểu đồ đường */}
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" /> {/* Lưới nền */}
                <XAxis dataKey="name" fontSize={11} /> {/* Trục X: ngày (MM-DD) */}
                <YAxis allowDecimals={false} fontSize={11} /> {/* Trục Y: số nguyên */}
                <Tooltip /><Legend /> {/* Tooltip và chú giải */}
                <Line type="monotone" dataKey="Lượt mượn" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} /> {/* Đường lượt mượn, có chấm điểm */}
              </LineChart> {/* Kết thúc LineChart */}
            </ResponsiveContainer> // Kết thúc container
          )} {/* Kết thúc nhánh dữ liệu */}
        </div> {/* Kết thúc panel theo ngày */}
      </div> {/* Kết thúc chart-grid */}
    </div> // Kết thúc khung
  ); // Kết thúc return
} // Kết thúc Reports
