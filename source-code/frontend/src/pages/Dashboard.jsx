import { useEffect, useState } from 'react'; // Hook side-effect và state
import { useNavigate } from 'react-router-dom'; // Hook chuyển trang
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts'; // Các thành phần vẽ biểu đồ từ thư viện recharts
import { reportsApi, loansApi } from '../api/services'; // API báo cáo và mượn/trả
import { fmtDate, STATUS_LABEL } from '../utils/format'; // Hàm định dạng ngày và nhãn trạng thái
import { IconBook, IconUsers, IconSwap, IconBell } from '../components/Icons'; // Các icon cho thẻ KPI

const fmt = (n) => (n ?? 0).toLocaleString('vi-VN'); // Định dạng số kiểu VN (null -> 0)
const loanCode = (id) => `PH-${String(id).padStart(4, '0')}`; // Tạo mã phiếu dạng PH-0001 từ id

const STATUS_COLORS = { // Màu cho từng trạng thái trong biểu đồ tròn
  PENDING: '#e0a458', BORROWED: '#e0744e', OVERDUE: '#c0392b', // Chờ duyệt / đang mượn / quá hạn
  RETURNED: '#1f3a5a', REJECTED: '#b8b2aa', // Đã trả / bị từ chối
}; // Kết thúc STATUS_COLORS

// Sparkline nhỏ trong thẻ KPI.
function Spark({ data, color }) { // Biểu đồ vùng mini hiển thị xu hướng trong thẻ số liệu
  if (!data || data.length === 0) return null; // Không có dữ liệu thì không vẽ
  return ( // Vẽ biểu đồ vùng nhỏ
    <ResponsiveContainer width="100%" height={40}> {/* Tự co giãn theo bề rộng, cao 40px */}
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}> {/* Biểu đồ vùng */}
        <defs> {/* Định nghĩa hiệu ứng màu chuyển sắc */}
          <linearGradient id={`sp-${color}`} x1="0" y1="0" x2="0" y2="1"> {/* Gradient dọc theo màu truyền vào */}
            <stop offset="0%" stopColor={color} stopOpacity={0.4} /> {/* Trên đậm 40% */}
            <stop offset="100%" stopColor={color} stopOpacity={0} /> {/* Dưới mờ dần về 0 */}
          </linearGradient> {/* Kết thúc gradient */}
        </defs> {/* Kết thúc defs */}
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sp-${color})`} /> {/* Đường + vùng tô, lấy giá trị từ khóa "v" */}
      </AreaChart> {/* Kết thúc AreaChart */}
    </ResponsiveContainer> // Kết thúc container
  ); // Kết thúc return
} // Kết thúc Spark

export default function Dashboard() { // Trang tổng quan
  const navigate = useNavigate(); // Hàm chuyển trang
  const [stats, setStats] = useState(null); // Số liệu tổng quan (KPI)
  const [week, setWeek] = useState([]); // Dữ liệu mượn/trả 7 ngày
  const [byStatus, setByStatus] = useState([]); // Phân bố phiếu theo trạng thái
  const [byCategory, setByCategory] = useState([]); // Số sách theo thể loại
  const [top, setTop] = useState([]); // Top sách mượn nhiều
  const [overdue, setOverdue] = useState([]); // Danh sách phiếu quá hạn
  const [recent, setRecent] = useState([]); // Hoạt động gần đây
  const [err, setErr] = useState(''); // Lỗi

  useEffect(() => { // Khi vào trang: tải song song nhiều nguồn dữ liệu
    reportsApi.dashboard().then(setStats).catch((e) => setErr(e.message)); // Số liệu KPI (bắt buộc, lỗi thì báo)
    reportsApi.borrowReturn7days().then(setWeek).catch(() => {}); // Mượn/trả 7 ngày
    reportsApi.loansByStatus().then(setByStatus).catch(() => {}); // Theo trạng thái
    reportsApi.booksByCategory().then(setByCategory).catch(() => {}); // Theo thể loại
    reportsApi.topBooks(4).then(setTop).catch(() => {}); // Top 4 sách
    loansApi.overdue().then(setOverdue).catch(() => {}); // Phiếu quá hạn
    loansApi.all().then((d) => setRecent(d.slice(0, 5))).catch(() => {}); // 5 hoạt động gần đây nhất
  }, []); // Chỉ chạy 1 lần

  if (err) return <div className="alert error">{err}</div>; // Có lỗi tải KPI -> hiện lỗi
  if (!stats) return <p>Đang tải...</p>; // Chưa có số liệu -> màn chờ

  const spark = week.map((d) => ({ v: d.borrowed })); // Dữ liệu sparkline cho lượt mượn
  const sparkR = week.map((d) => ({ v: d.returned })); // Dữ liệu sparkline cho lượt trả

  const kpis = [ // Cấu hình 4 thẻ số liệu (KPI)
    { tone: 'peach', icon: IconBook, label: 'Tổng số sách', value: stats.totalBooks, sub: `${fmt(stats.totalCopies)} bản sao`, color: '#e0744e', data: spark }, // Tổng sách
    { tone: 'blue', icon: IconUsers, label: 'Độc giả / Người dùng', value: stats.totalUsers, sub: 'tài khoản', color: '#1f3a5a', data: sparkR }, // Người dùng
    { tone: 'peach', icon: IconSwap, label: 'Sách đang cho mượn', value: stats.borrowed, sub: `${fmt(stats.pending)} chờ duyệt`, color: '#e0744e', data: spark }, // Đang mượn
    { tone: 'red', icon: IconBell, label: 'Sách quá hạn / Chưa trả', value: stats.overdue, sub: 'cần nhắc nhở', color: '#c0392b', data: sparkR }, // Quá hạn
  ]; // Kết thúc kpis

  const weekData = week.map((d) => ({ name: d.label, Mượn: d.borrowed, Trả: d.returned })); // Chuẩn hóa dữ liệu cho biểu đồ vùng 7 ngày
  const statusData = byStatus.filter((s) => s.count > 0) // Bỏ trạng thái có 0 phiếu
    .map((s) => ({ name: STATUS_LABEL[s.status] || s.status, key: s.status, value: s.count })); // Chuẩn hóa cho biểu đồ tròn
  const catData = byCategory.map((c) => ({ name: c.category, 'Số sách': c.count })); // Chuẩn hóa cho biểu đồ cột ngang

  const activityText = (l) => { // Hàm tạo câu mô tả một hoạt động gần đây
    const who = l.user?.fullName || 'Độc giả'; // Tên người (hoặc mặc định)
    const book = l.book?.title || 'sách'; // Tên sách (hoặc mặc định)
    if (l.status === 'RETURNED') return `${who} đã trả "${book}"`; // Đã trả
    if (l.status === 'BORROWED' || l.status === 'OVERDUE') return `${who} đang mượn "${book}"`; // Đang mượn/quá hạn
    if (l.status === 'REJECTED') return `Từ chối yêu cầu mượn "${book}" của ${who}`; // Bị từ chối
    return `${who} gửi yêu cầu mượn "${book}"`; // Còn lại: gửi yêu cầu (chờ duyệt)
  }; // Kết thúc activityText
  const remind = (l) => alert(`Đã gửi nhắc nhở tới "${l.user?.fullName}" về sách "${l.book?.title}".`); // Giả lập gửi nhắc nhở (hiện hộp thoại)

  return ( // Giao diện dashboard
    <div className="libra"> {/* Khung tổng */}
      <div className="lb-head"> {/* Phần đầu trang */}
        <div> {/* Khối tiêu đề */}
          <h1 className="page-title">Dashboard</h1> {/* Tiêu đề */}
          <p className="lb-sub">Tổng quan hoạt động Thư viện Mini</p> {/* Mô tả phụ */}
        </div> {/* Kết thúc khối tiêu đề */}
      </div> {/* Kết thúc lb-head */}

      {/* KPI */}
      <div className="lb-kpis"> {/* Hàng các thẻ số liệu */}
        {kpis.map((k) => ( // Duyệt từng KPI
          <div key={k.label} className={`lb-kpi ${k.tone}`}> {/* Thẻ KPI, màu theo tone */}
            <div className="lb-kpi-row"> {/* Hàng trên: icon + số */}
              <div className="lb-kpi-ic"><k.icon /></div> {/* Icon */}
              <div className="lb-kpi-meta"> {/* Nhãn và giá trị */}
                <span className="lb-kpi-label">{k.label}</span> {/* Nhãn KPI */}
                <span className="lb-kpi-val">{fmt(k.value)}</span> {/* Giá trị chính */}
              </div> {/* Kết thúc meta */}
            </div> {/* Kết thúc hàng trên */}
            <div className="lb-kpi-foot"> {/* Chân thẻ: chú thích phụ */}
              <span className="lb-kpi-sub">{k.sub}</span> {/* Mô tả phụ (vd số bản sao) */}
            </div> {/* Kết thúc chân */}
            <div className="lb-kpi-spark"><Spark data={k.data} color={k.color} /></div> {/* Biểu đồ mini xu hướng */}
          </div> // Kết thúc thẻ KPI
        ))} {/* Kết thúc map kpis */}
      </div> {/* Kết thúc lb-kpis */}

      {/* Hàng 1: biểu đồ chính + donut trạng thái */}
      <div className="lb-row r-2-1"> {/* Hàng chia tỉ lệ 2:1 */}
        <div className="lb-card"> {/* Thẻ biểu đồ mượn/trả */}
          <div className="lb-card-head"><h3>Lượt Mượn &amp; Trả Sách</h3><span className="lb-pill">7 ngày gần nhất</span></div> {/* Tiêu đề thẻ */}
          <ResponsiveContainer width="100%" height={280}> {/* Khung biểu đồ tự co giãn */}
            <AreaChart data={weekData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}> {/* Biểu đồ vùng */}
              <defs> {/* Hai gradient cho 2 đường */}
                <linearGradient id="gMuon" x1="0" y1="0" x2="0" y2="1"> {/* Gradient màu "Mượn" */}
                  <stop offset="0%" stopColor="#e0744e" stopOpacity={0.35} /><stop offset="100%" stopColor="#e0744e" stopOpacity={0} /> {/* Đậm trên, mờ dưới */}
                </linearGradient> {/* Kết thúc gradient Mượn */}
                <linearGradient id="gTra" x1="0" y1="0" x2="0" y2="1"> {/* Gradient màu "Trả" */}
                  <stop offset="0%" stopColor="#1f3a5a" stopOpacity={0.3} /><stop offset="100%" stopColor="#1f3a5a" stopOpacity={0} /> {/* Đậm trên, mờ dưới */}
                </linearGradient> {/* Kết thúc gradient Trả */}
              </defs> {/* Kết thúc defs */}
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} /> {/* Lưới nền ngang */}
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} /> {/* Trục X: nhãn ngày */}
              <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} /> {/* Trục Y: số nguyên */}
              <Tooltip /><Legend /> {/* Chú thích khi rê chuột và chú giải màu */}
              <Area type="monotone" dataKey="Mượn" stroke="#e0744e" strokeWidth={2.5} fill="url(#gMuon)" /> {/* Đường lượt mượn */}
              <Area type="monotone" dataKey="Trả" stroke="#1f3a5a" strokeWidth={2.5} fill="url(#gTra)" /> {/* Đường lượt trả */}
            </AreaChart> {/* Kết thúc AreaChart */}
          </ResponsiveContainer> {/* Kết thúc container */}
        </div> {/* Kết thúc thẻ biểu đồ mượn/trả */}

        <div className="lb-card"> {/* Thẻ biểu đồ tròn trạng thái */}
          <div className="lb-card-head"><h3>Trạng thái phiếu mượn</h3></div> {/* Tiêu đề */}
          {statusData.length === 0 ? <p className="muted">Chưa có phiếu mượn.</p> : ( // Không có dữ liệu thì báo
            <ResponsiveContainer width="100%" height={280}> {/* Khung biểu đồ */}
              <PieChart> {/* Biểu đồ tròn */}
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                     innerRadius={55} outerRadius={90} paddingAngle={2}
                     label={(e) => `${e.value}`} labelLine={false} fontSize={12}> {/* Vòng donut, hiện số trên mỗi phần */}
                  {statusData.map((e) => <Cell key={e.key} fill={STATUS_COLORS[e.key] || '#ccc'} />)} {/* Tô màu từng phần theo trạng thái */}
                </Pie> {/* Kết thúc Pie */}
                <Tooltip /><Legend iconType="circle" /> {/* Tooltip và chú giải */}
              </PieChart> {/* Kết thúc PieChart */}
            </ResponsiveContainer> // Kết thúc container
          )} {/* Kết thúc nhánh dữ liệu */}
        </div> {/* Kết thúc thẻ trạng thái */}
      </div> {/* Kết thúc hàng 1 */}

      {/* Hàng 2: sách theo thể loại + top sách */}
      <div className="lb-row r-1-1"> {/* Hàng chia đều 1:1 */}
        <div className="lb-card"> {/* Thẻ biểu đồ thể loại */}
          <div className="lb-card-head"><h3>Số đầu sách theo thể loại</h3></div> {/* Tiêu đề */}
          {catData.length === 0 ? <p className="muted">Chưa có thể loại.</p> : ( // Không có thì báo
            <ResponsiveContainer width="100%" height={240}> {/* Khung biểu đồ */}
              <BarChart layout="vertical" data={catData} margin={{ top: 4, right: 16, left: 24, bottom: 4 }}> {/* Biểu đồ cột nằm ngang */}
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} /> {/* Lưới dọc */}
                <XAxis type="number" allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} /> {/* Trục X: số sách */}
                <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={90} /> {/* Trục Y: tên thể loại */}
                <Tooltip /> {/* Tooltip */}
                <Bar dataKey="Số sách" fill="#e0744e" radius={[0, 6, 6, 0]} barSize={16} /> {/* Cột số sách, bo góc phải */}
              </BarChart> {/* Kết thúc BarChart */}
            </ResponsiveContainer> // Kết thúc container
          )} {/* Kết thúc nhánh dữ liệu */}
        </div> {/* Kết thúc thẻ thể loại */}

        <div className="lb-card"> {/* Thẻ top sách */}
          <div className="lb-card-head"><h3>Top sách được mượn nhiều</h3></div> {/* Tiêu đề */}
          <ul className="lb-top"> {/* Danh sách top */}
            {top.map((t, i) => ( // Duyệt từng sách top (i = thứ hạng)
              <li key={t.bookId}> {/* Một dòng */}
                <span className={`lb-rank r${i + 1}`}>{i + 1}</span> {/* Số thứ hạng (1,2,3...) */}
                <span className="lb-top-title">{t.title}</span> {/* Tên sách */}
                <span className="lb-top-count">{t.borrowCount} lượt</span> {/* Số lượt mượn */}
              </li> // Kết thúc dòng
            ))} {/* Kết thúc map top */}
            {top.length === 0 && <li className="muted">Chưa có dữ liệu mượn.</li>} {/* Thông báo khi rỗng */}
          </ul> {/* Kết thúc danh sách top */}
        </div> {/* Kết thúc thẻ top sách */}
      </div> {/* Kết thúc hàng 2 */}

      {/* Hàng 3: bảng quá hạn + hoạt động gần đây */}
      <div className="lb-row r-2-1"> {/* Hàng tỉ lệ 2:1 */}
        <div className="lb-card"> {/* Thẻ bảng quá hạn */}
          <div className="lb-card-head"> {/* Tiêu đề thẻ */}
            <h3 className="danger-title">⚠️ Sách quá hạn trả</h3> {/* Tiêu đề cảnh báo */}
            <span className="lb-pill danger">{overdue.length} phiếu</span> {/* Số phiếu quá hạn */}
          </div> {/* Kết thúc tiêu đề */}
          <table className="table lb-table"> {/* Bảng phiếu quá hạn */}
            <thead> {/* Tiêu đề bảng */}
              <tr><th>Mã phiếu</th><th>Tên sách</th><th>Độc giả</th><th>Ngày phải trả</th><th>Trễ</th><th>Phí phạt</th><th></th></tr> {/* Các cột */}
            </thead> {/* Kết thúc thead */}
            <tbody> {/* Thân bảng */}
              {overdue.map((l) => ( // Duyệt từng phiếu quá hạn
                <tr key={l.id}> {/* Một dòng */}
                  <td>{loanCode(l.id)}</td> {/* Mã phiếu dạng PH-xxxx */}
                  <td>{l.book?.title}</td> {/* Tên sách */}
                  <td>{l.user?.fullName}</td> {/* Độc giả */}
                  <td>{fmtDate(l.dueDate)}</td> {/* Ngày phải trả */}
                  <td><span className="badge danger">{l.overdueDays} ngày</span></td> {/* Số ngày trễ */}
                  <td>{fmt(l.estimatedFine)}đ</td> {/* Phí phạt dự kiến */}
                  <td><button className="btn-coral" onClick={() => remind(l)}>Gửi nhắc nhở</button></td> {/* Nút nhắc nhở */}
                </tr> // Kết thúc dòng
              ))} {/* Kết thúc map quá hạn */}
              {overdue.length === 0 && <tr><td colSpan="7" className="muted">Không có sách quá hạn. 🎉</td></tr>} {/* Thông báo khi không có */}
            </tbody> {/* Kết thúc tbody */}
          </table> {/* Kết thúc bảng */}
        </div> {/* Kết thúc thẻ quá hạn */}

        <div className="lb-card"> {/* Thẻ hoạt động gần đây */}
          <div className="lb-card-head"><h3>Hoạt động gần đây</h3></div> {/* Tiêu đề */}
          <ul className="lb-activity"> {/* Danh sách hoạt động */}
            {recent.map((l) => ( // Duyệt từng hoạt động
              <li key={l.id}> {/* Một mục */}
                <span className={`lb-dot ${l.status}`} /> {/* Chấm màu theo trạng thái */}
                <div> {/* Nội dung mục */}
                  <p>{activityText(l)}</p> {/* Câu mô tả hoạt động */}
                  <span className="lb-time">{fmtDate(l.requestedAt)} · {STATUS_LABEL[l.status]}</span> {/* Thời gian + nhãn trạng thái */}
                </div> {/* Kết thúc nội dung */}
              </li> // Kết thúc mục
            ))} {/* Kết thúc map hoạt động */}
            {recent.length === 0 && <li className="muted">Chưa có hoạt động.</li>} {/* Thông báo khi rỗng */}
          </ul> {/* Kết thúc danh sách */}
          <button className="lb-link" onClick={() => navigate('/manage/loans')}>Xem tất cả →</button> {/* Liên kết sang trang quản lý mượn/trả */}
        </div> {/* Kết thúc thẻ hoạt động */}
      </div> {/* Kết thúc hàng 3 */}
    </div> // Kết thúc khung tổng
  ); // Kết thúc return
} // Kết thúc Dashboard
