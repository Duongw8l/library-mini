import { useEffect, useState } from 'react'; // Hook side-effect và state
import { loansApi } from '../api/services'; // API mượn/trả
import { STATUS_LABEL, STATUS_CLASS, fmtDate, fmtMoney } from '../utils/format'; // Nhãn/màu trạng thái và hàm định dạng ngày/tiền

export default function MyLoans() { // Trang phiếu mượn của sinh viên
  const [loans, setLoans] = useState([]); // State danh sách phiếu
  const [err, setErr] = useState(''); // State lỗi

  const load = () => loansApi.my().then(setLoans).catch((e) => setErr(e.message)); // Tải các phiếu của tôi
  useEffect(() => { load(); }, []); // Tải khi vào trang

  const renew = async (id) => { // Hàm gia hạn một phiếu
    setErr(''); // Xóa lỗi cũ
    try { // Thử gia hạn
      await loansApi.renew(id); // Gọi API gia hạn
      load(); // Tải lại danh sách cho cập nhật
    } catch (e) { // Nếu lỗi (vd quá hạn, hết lượt gia hạn)
      setErr(e.message); // Hiển thị lỗi
    } // Kết thúc try
  }; // Kết thúc renew

  return ( // Giao diện
    <div className="container"> {/* Khung trang */}
      <h1 className="page-title">Phiếu mượn của tôi</h1> {/* Tiêu đề */}
      {err && <div className="alert error">{err}</div>} {/* Ô lỗi nếu có */}
      <table className="table"> {/* Bảng phiếu mượn */}
        <thead> {/* Tiêu đề bảng */}
          <tr><th>Sách</th><th>Trạng thái</th><th>Ngày mượn</th><th>Hạn trả</th><th>Gia hạn</th><th>Phí phạt</th><th></th></tr> {/* Các cột */}
        </thead> {/* Kết thúc thead */}
        <tbody> {/* Thân bảng */}
          {loans.map((l) => ( // Duyệt từng phiếu
            <tr key={l.id}> {/* Một dòng phiếu */}
              <td>{l.book?.title}</td> {/* Tên sách */}
              <td><span className={STATUS_CLASS[l.status]}>{STATUS_LABEL[l.status]}</span></td> {/* Trạng thái (có màu) */}
              <td>{fmtDate(l.borrowedAt)}</td> {/* Ngày mượn */}
              <td>{fmtDate(l.dueDate)}</td> {/* Hạn trả */}
              <td>{l.renewalCount}/2</td> {/* Số lần đã gia hạn / tối đa */}
              <td>{fmtMoney(l.fineAmount)}</td> {/* Phí phạt */}
              <td> {/* Cột thao tác */}
                {l.status === 'BORROWED' && ( // Chỉ phiếu đang mượn mới cho gia hạn
                  <button className="btn btn-sm" onClick={() => renew(l.id)}>Gia hạn</button> // Nút gia hạn
                )} {/* Kết thúc điều kiện */}
              </td> {/* Kết thúc cột thao tác */}
            </tr> // Kết thúc dòng
          ))} {/* Kết thúc map phiếu */}
          {loans.length === 0 && <tr><td colSpan="7" className="muted">Chưa có phiếu mượn nào.</td></tr>} {/* Thông báo khi rỗng */}
        </tbody> {/* Kết thúc tbody */}
      </table> {/* Kết thúc bảng */}
    </div> // Kết thúc container
  ); // Kết thúc return
} // Kết thúc MyLoans
