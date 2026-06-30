import { useEffect, useState } from 'react'; // Hook side-effect và state
import { booksApi, categoriesApi, authorsApi } from '../api/services'; // API sách, thể loại, tác giả

const EMPTY = { title: '', isbn: '', categoryId: '', authorName: '', publisher: '', publishedYear: '', totalCopies: 1, description: '' }; // Giá trị form rỗng (authorName: nhập tên tác giả dạng text)

export default function ManageBooks() { // Trang quản lý đầu sách (thêm/sửa/xóa)
  const [books, setBooks] = useState([]); // State danh sách sách
  const [categories, setCategories] = useState([]); // State danh sách thể loại (cho dropdown)
  const [authors, setAuthors] = useState([]); // State danh sách tác giả (cho dropdown)
  const [form, setForm] = useState(EMPTY); // State dữ liệu form
  const [editingId, setEditingId] = useState(null); // id sách đang sửa (null = đang thêm mới)
  const [err, setErr] = useState(''); // State lỗi
  const [msg, setMsg] = useState(''); // State thông báo thành công

  const load = async () => { // Hàm tải danh sách sách
    const res = await booksApi.list({ limit: 100 }); // Lấy tối đa 100 sách
    setBooks(res.data); // Lưu danh sách
  }; // Kết thúc load
  useEffect(() => { // Khi vào trang
    load(); // Tải sách
    categoriesApi.list().then(setCategories); // Tải thể loại
    authorsApi.list().then(setAuthors); // Tải tác giả
  }, []); // Chỉ chạy 1 lần

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value }); // Cập nhật đúng trường form theo name của ô nhập

  // Tìm hoặc tạo tác giả theo tên gõ vào, trả về authorId (null nếu để trống)
  const resolveAuthorId = async (name) => { // Xử lý ô nhập tên tác giả
    const trimmed = (name || '').trim(); // Bỏ khoảng trắng thừa
    if (!trimmed) return null; // Để trống -> không gắn tác giả
    const existing = authors.find((a) => a.name.toLowerCase() === trimmed.toLowerCase()); // Tìm tác giả đã có (không phân biệt hoa/thường)
    if (existing) return existing.id; // Đã có -> dùng lại id
    const created = await authorsApi.create(trimmed); // Chưa có -> tạo tác giả mới
    setAuthors((prev) => [...prev, created]); // Thêm vào danh sách gợi ý cho lần sau
    return created.id; // Trả id tác giả vừa tạo
  }; // Kết thúc resolveAuthorId

  const submit = async (e) => { // Hàm xử lý gửi form (thêm hoặc sửa)
    e.preventDefault(); // Ngăn reload trang
    setErr(''); setMsg(''); // Xóa thông báo cũ
    try { // Thử lưu
      const authorId = await resolveAuthorId(form.authorName); // Quy đổi tên tác giả -> id (tự tạo nếu chưa có)
      const payload = { // Chuẩn hóa dữ liệu trước khi gửi
        ...form, // Sao chép các trường form
        categoryId: form.categoryId ? Number(form.categoryId) : null, // Ép thể loại sang số (rỗng -> null)
        authorId, // Gắn id tác giả vừa quy đổi (backend bỏ qua trường authorName thừa)
        publishedYear: form.publishedYear ? Number(form.publishedYear) : null, // Ép năm sang số
        totalCopies: Number(form.totalCopies), // Ép số bản sang số
      }; // Kết thúc payload
      if (editingId) { // Nếu đang sửa
        await booksApi.update(editingId, payload); // Gọi API cập nhật
        setMsg('Đã cập nhật sách.'); // Báo thành công
      } else { // Nếu đang thêm mới
        await booksApi.create(payload); // Gọi API tạo
        setMsg('Đã thêm sách.'); // Báo thành công
      } // Kết thúc phân nhánh
      setForm(EMPTY); setEditingId(null); // Reset form về trạng thái thêm mới
      load(); // Tải lại danh sách
    } catch (e2) { // Nếu lỗi
      setErr(e2.message); // Hiển thị lỗi
    } // Kết thúc try
  }; // Kết thúc submit

  const edit = (b) => { // Hàm chuyển form sang chế độ sửa một sách
    setEditingId(b.id); // Ghi nhớ id đang sửa
    setForm({ // Đổ dữ liệu sách vào form
      title: b.title, isbn: b.isbn || '', categoryId: b.category?.id || '', authorName: b.author?.name || '', // Tiêu đề, ISBN, thể loại, tên tác giả
      publisher: b.publisher || '', publishedYear: b.publishedYear || '', totalCopies: b.totalCopies, description: b.description || '', // NXB, năm, số bản, mô tả
    }); // Kết thúc setForm
  }; // Kết thúc edit

  const setCopies = async (b) => { // Hàm đổi nhanh tổng số bản
    const v = prompt(`Tổng số bản mới cho "${b.title}":`, b.totalCopies); // Hỏi số bản mới qua hộp thoại
    if (v == null) return; // Người dùng bấm Hủy -> dừng
    setErr(''); // Xóa lỗi
    try { await booksApi.setCopies(b.id, Number(v)); load(); } catch (e) { setErr(e.message); } // Gọi API, refresh; lỗi thì hiển thị
  }; // Kết thúc setCopies

  const remove = async (b) => { // Hàm xóa sách
    if (!confirm(`Xóa "${b.title}"?`)) return; // Hỏi xác nhận; không đồng ý thì dừng
    setErr(''); // Xóa lỗi
    try { await booksApi.remove(b.id); load(); } catch (e) { setErr(e.message); } // Gọi API xóa, refresh; lỗi thì hiển thị
  }; // Kết thúc remove

  return ( // Giao diện
    <div className="container"> {/* Khung trang */}
      <h1 className="page-title">Quản lý đầu sách</h1> {/* Tiêu đề */}
      {err && <div className="alert error">{err}</div>} {/* Ô lỗi */}
      {msg && <div className="alert ok">{msg}</div>} {/* Ô thông báo thành công */}

      <form className="card form-grid" onSubmit={submit}> {/* Form thêm/sửa sách */}
        <h3>{editingId ? 'Sửa sách' : 'Thêm sách mới'}</h3> {/* Tiêu đề form đổi theo chế độ */}
        <input name="title" placeholder="Tiêu đề *" value={form.title} onChange={onChange} required /> {/* Ô tiêu đề (bắt buộc) */}
        <input name="isbn" placeholder="ISBN" value={form.isbn} onChange={onChange} /> {/* Ô ISBN */}
        <select name="categoryId" value={form.categoryId} onChange={onChange}> {/* Dropdown thể loại */}
          <option value="">-- Thể loại --</option> {/* Lựa chọn trống */}
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)} {/* Liệt kê thể loại */}
        </select> {/* Kết thúc dropdown thể loại */}
        <input name="authorName" placeholder="Tác giả" value={form.authorName} onChange={onChange} list="author-options" /> {/* Ô nhập tên tác giả (gõ tự do, có gợi ý) */}
        <datalist id="author-options"> {/* Danh sách gợi ý tác giả đã có (vẫn cho phép nhập tên mới) */}
          {authors.map((a) => <option key={a.id} value={a.name} />)} {/* Mỗi tác giả là một gợi ý */}
        </datalist> {/* Kết thúc danh sách gợi ý */}
        <input name="publisher" placeholder="NXB" value={form.publisher} onChange={onChange} /> {/* Ô nhà xuất bản */}
        <input name="publishedYear" placeholder="Năm XB" type="number" value={form.publishedYear} onChange={onChange} /> {/* Ô năm xuất bản */}
        <input name="totalCopies" placeholder="Số bản" type="number" min="1" value={form.totalCopies} onChange={onChange} /> {/* Ô số bản (≥1) */}
        <input name="description" placeholder="Mô tả" value={form.description} onChange={onChange} /> {/* Ô mô tả */}
        <div className="actions"> {/* Khu vực nút */}
          <button className="btn btn-primary">{editingId ? 'Lưu' : 'Thêm'}</button> {/* Nút lưu/thêm theo chế độ */}
          {editingId && <button type="button" className="btn" onClick={() => { setForm(EMPTY); setEditingId(null); }}>Hủy</button>} {/* Nút hủy sửa (chỉ hiện khi đang sửa) */}
        </div> {/* Kết thúc actions */}
      </form> {/* Kết thúc form */}

      <table className="table"> {/* Bảng danh sách sách */}
        <thead> {/* Tiêu đề bảng */}
          <tr><th>Tiêu đề</th><th>Thể loại</th><th>Còn/Tổng</th><th>Thao tác</th></tr> {/* Các cột */}
        </thead> {/* Kết thúc thead */}
        <tbody> {/* Thân bảng */}
          {books.map((b) => ( // Duyệt từng sách
            <tr key={b.id}> {/* Một dòng sách */}
              <td>{b.title}</td> {/* Tiêu đề */}
              <td>{b.category?.name || '-'}</td> {/* Thể loại */}
              <td>{b.availableCopies}/{b.totalCopies}</td> {/* Còn / tổng số bản */}
              <td className="actions"> {/* Cột nút thao tác */}
                <button className="btn btn-sm" onClick={() => edit(b)}>Sửa</button> {/* Nút sửa */}
                <button className="btn btn-sm" onClick={() => setCopies(b)}>Số bản</button> {/* Nút đổi số bản */}
                <button className="btn btn-sm" onClick={() => remove(b)}>Xóa</button> {/* Nút xóa */}
              </td> {/* Kết thúc cột thao tác */}
            </tr> // Kết thúc dòng
          ))} {/* Kết thúc map sách */}
        </tbody> {/* Kết thúc tbody */}
      </table> {/* Kết thúc bảng */}
    </div> // Kết thúc container
  ); // Kết thúc return
} // Kết thúc ManageBooks
