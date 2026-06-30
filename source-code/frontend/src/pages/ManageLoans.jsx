import { useEffect, useState } from 'react'; // Hook side-effect và state
import { loansApi } from '../api/services'; // API mượn/trả
import { STATUS_LABEL, STATUS_CLASS, fmtDate, fmtMoney } from '../utils/format'; // Nhãn/màu trạng thái và hàm định dạng

const TABS = ['PENDING', 'BORROWED', 'OVERDUE', 'RETURNED', 'REJECTED']; // Các tab lọc theo trạng thái phiếu

export default function ManageLoans() { // Trang thủ thư duyệt mượn / xác nhận trả
  const [tab, setTab] = useState('PENDING'); // State tab đang chọn (mặc định "chờ duyệt")
  const [loans, setLoans] = useState([]); // State danh sách phiếu theo tab
  const [err, setErr] = useState(''); // State lỗi

  const load = (status = tab) => { // Hàm tải phiếu theo trạng thái
    setErr(''); // Xóa lỗi cũ
    loansApi.all(status).then(setLoans).catch((e) => setErr(e.message)); // Gọi API lấy phiếu theo trạng thái
  }; // Kết thúc load
  useEffect(() => { load(tab); /* eslint-disable-next-line */ }, [tab]); // Tải lại mỗi khi đổi tab

  const act = async (fn) => { // Hàm bọc thực thi một thao tác rồi tải lại
    setErr(''); // Xóa lỗi
    try { await fn(); load(); } catch (e) { setErr(e.message); } // Chạy thao tác, thành công thì refresh; lỗi thì hiển thị
  }; // Kết thúc act

  const hasActions = ['PENDING', 'BORROWED', 'OVERDUE'].includes(tab); // Chỉ các tab này mới có nút thao tác (ẩn cột ở Đã trả / Bị từ chối)

  return ( // Giao diện
    <div className="container"> {/* Khung trang */}
      <h1 className="page-title">Duyệt mượn — Trả sách</h1> {/* Tiêu đề */}
      <div className="tabs"> {/* Hàng tab lọc trạng thái */}
        {TABS.map((t) => ( // Duyệt từng tab
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}> {/* Nút tab, tô đậm khi đang chọn */}
            {STATUS_LABEL[t]} {/* Nhãn tiếng Việt của trạng thái */}
          </button> // Kết thúc nút tab
        ))} {/* Kết thúc map tab */}
      </div> {/* Kết thúc tabs */}
      {err && <div className="alert error">{err}</div>} {/* Ô lỗi nếu có */}
      <table className="table"> {/* Bảng phiếu mượn */}
        <thead> {/* Tiêu đề bảng */}
          <tr><th>Sách</th><th>Người mượn</th><th>Trạng thái</th><th>Hạn trả</th><th>Phí phạt</th>{hasActions && <th>Thao tác</th>}</tr> {/* Các cột; cột Thao tác chỉ hiện ở tab có nút */}
        </thead> {/* Kết thúc thead */}
        <tbody> {/* Thân bảng */}
          {loans.map((l) => ( // Duyệt từng phiếu
            <tr key={l.id}> {/* Một dòng phiếu */}
              <td>{l.book?.title}</td> {/* Tên sách */}
              <td>{l.user?.fullName}</td> {/* Người mượn */}
              <td><span className={STATUS_CLASS[l.status]}>{STATUS_LABEL[l.status]}</span></td> {/* Trạng thái có màu */}
              <td>{fmtDate(l.dueDate)}</td> {/* Hạn trả */}
              <td>{fmtMoney(l.fineAmount)}</td> {/* Phí phạt */}
              {hasActions && ( // Chỉ render cột thao tác ở các tab có nút (giữ bảng thẳng hàng)
                <td className="actions"> {/* Cột nút thao tác */}
                  {l.status === 'PENDING' && ( // Nếu phiếu đang chờ duyệt
                    <> {/* Nhóm 2 nút */}
                      <button className="btn btn-sm btn-primary" onClick={() => act(() => loansApi.approve(l.id))}>Duyệt</button> {/* Nút duyệt */}
                      <button className="btn btn-sm" onClick={() => act(() => loansApi.reject(l.id, prompt('Lý do từ chối:') || 'Không rõ'))}>Từ chối</button> {/* Nút từ chối, hỏi lý do qua prompt */}
                    </> // Kết thúc nhóm
                  )} {/* Kết thúc nhánh PENDING */}
                  {(l.status === 'BORROWED' || l.status === 'OVERDUE') && ( // Nếu đang mượn/quá hạn
                    <button className="btn btn-sm btn-primary" onClick={() => act(() => loansApi.returnBook(l.id))}>Xác nhận trả</button> // Nút xác nhận trả
                  )} {/* Kết thúc nhánh trả */}
                </td> // Kết thúc cột thao tác
              )} {/* Kết thúc điều kiện hiện cột thao tác */}
            </tr> // Kết thúc dòng
          ))} {/* Kết thúc map phiếu */}
          {loans.length === 0 && <tr><td colSpan={hasActions ? 6 : 5} className="muted">Không có phiếu nào.</td></tr>} {/* Thông báo khi rỗng (số cột khớp có/không có cột thao tác) */}
        </tbody> {/* Kết thúc tbody */}
      </table> {/* Kết thúc bảng */}
    </div> // Kết thúc container
  ); // Kết thúc return
} // Kết thúc ManageLoans
