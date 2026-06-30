import { useEffect, useState } from 'react'; // Hook side-effect và state
import { useParams, useNavigate } from 'react-router-dom'; // Hook đọc tham số đường dẫn (:id) và chuyển trang
import { booksApi, loansApi } from '../api/services'; // API sách và mượn/trả
import { useAuth } from '../context/AuthContext'; // Hook lấy thông tin đăng nhập

export default function BookDetail() { // Trang chi tiết một cuốn sách
  const { id } = useParams(); // Lấy id sách từ URL
  const { user } = useAuth(); // Lấy user hiện tại
  const navigate = useNavigate(); // Hàm chuyển trang
  const [book, setBook] = useState(null); // State dữ liệu sách
  const [msg, setMsg] = useState(null); // State thông báo thành công
  const [err, setErr] = useState(''); // State thông báo lỗi

  useEffect(() => { // Khi id đổi
    booksApi.get(id).then(setBook).catch((e) => setErr(e.message)); // Tải chi tiết sách theo id
  }, [id]); // Phụ thuộc id

  const borrow = async () => { // Hàm gửi yêu cầu mượn
    setErr(''); setMsg(null); // Xóa thông báo cũ
    try { // Thử gửi yêu cầu
      await loansApi.request(book.id); // Gọi API tạo yêu cầu mượn
      setMsg('Đã gửi yêu cầu mượn. Vui lòng chờ thủ thư duyệt.'); // Báo thành công
    } catch (e) { // Nếu lỗi (vd hết bản, quá hạn mức)
      setErr(e.message); // Hiển thị lỗi
    } // Kết thúc try
  }; // Kết thúc borrow

  if (err && !book) return <div className="container"><div className="alert error">{err}</div></div>; // Lỗi tải sách -> chỉ hiện lỗi
  if (!book) return <div className="container">Đang tải...</div>; // Chưa có dữ liệu -> màn chờ

  return ( // Giao diện chi tiết
    <div className="container narrow"> {/* Khung hẹp */}
      <button className="btn btn-sm" onClick={() => navigate(-1)}>← Quay lại</button> {/* Nút quay lại trang trước */}
      <div className="card"> {/* Thẻ thông tin sách */}
        <h2>{book.title}</h2> {/* Tiêu đề sách */}
        <p><b>Tác giả:</b> {book.author?.name || '-'}</p> {/* Tác giả */}
        <p><b>Thể loại:</b> {book.category?.name || '-'}</p> {/* Thể loại */}
        <p><b>ISBN:</b> {book.isbn || '-'}</p> {/* Mã ISBN */}
        <p><b>NXB:</b> {book.publisher || '-'} ({book.publishedYear || '?'})</p> {/* Nhà xuất bản và năm */}
        <p><b>Mô tả:</b> {book.description || 'Không có mô tả.'}</p> {/* Mô tả */}
        <p> {/* Dòng tình trạng */}
          <b>Tình trạng:</b>{' '} {/* Nhãn */}
          <span className={book.availableCopies > 0 ? 'badge ok' : 'badge danger'}> {/* Xanh nếu còn, đỏ nếu hết */}
            Còn {book.availableCopies}/{book.totalCopies} bản {/* Số bản còn / tổng */}
          </span> {/* Kết thúc badge */}
        </p> {/* Kết thúc dòng tình trạng */}

        {msg && <div className="alert ok">{msg}</div>} {/* Ô thông báo thành công */}
        {err && <div className="alert error">{err}</div>} {/* Ô thông báo lỗi */}

        {user?.role === 'STUDENT' && ( // Chỉ sinh viên mới thấy nút mượn
          <button className="btn btn-primary" disabled={book.availableCopies <= 0} onClick={borrow}> {/* Nút mượn, khóa khi hết bản */}
            {book.availableCopies > 0 ? 'Đăng ký mượn' : 'Đã hết bản'} {/* Đổi chữ theo tình trạng */}
          </button> // Kết thúc nút mượn
        )} {/* Kết thúc điều kiện sinh viên */}
        {!user && <p className="muted">Đăng nhập bằng tài khoản sinh viên để mượn sách.</p>} {/* Nhắc đăng nhập nếu chưa */}
      </div> {/* Kết thúc card */}
    </div> // Kết thúc container
  ); // Kết thúc return
} // Kết thúc BookDetail
