import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksApi, loansApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    booksApi.get(id).then(setBook).catch((e) => setErr(e.message));
  }, [id]);

  const borrow = async () => {
    setErr(''); setMsg(null);
    try {
      await loansApi.request(book.id);
      setMsg('Đã gửi yêu cầu mượn. Vui lòng chờ thủ thư duyệt.');
    } catch (e) {
      setErr(e.message);
    }
  };

  if (err && !book) return <div className="container"><div className="alert error">{err}</div></div>;
  if (!book) return <div className="container">Đang tải...</div>;

  return (
    <div className="container narrow">
      <button className="btn btn-sm" onClick={() => navigate(-1)}>← Quay lại</button>
      <div className="card">
        <h2>{book.title}</h2>
        <p><b>Tác giả:</b> {book.author?.name || '-'}</p>
        <p><b>Thể loại:</b> {book.category?.name || '-'}</p>
        <p><b>ISBN:</b> {book.isbn || '-'}</p>
        <p><b>NXB:</b> {book.publisher || '-'} ({book.publishedYear || '?'})</p>
        <p><b>Mô tả:</b> {book.description || 'Không có mô tả.'}</p>
        <p>
          <b>Tình trạng:</b>{' '}
          <span className={book.availableCopies > 0 ? 'badge ok' : 'badge danger'}>
            Còn {book.availableCopies}/{book.totalCopies} bản
          </span>
        </p>

        {msg && <div className="alert ok">{msg}</div>}
        {err && <div className="alert error">{err}</div>}

        {user?.role === 'STUDENT' && (
          <button className="btn btn-primary" disabled={book.availableCopies <= 0} onClick={borrow}>
            {book.availableCopies > 0 ? 'Đăng ký mượn' : 'Đã hết bản'}
          </button>
        )}
        {!user && <p className="muted">Đăng nhập bằng tài khoản sinh viên để mượn sách.</p>}
      </div>
    </div>
  );
}
