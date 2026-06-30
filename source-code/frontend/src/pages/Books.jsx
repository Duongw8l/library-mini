import { useEffect, useState } from 'react'; // Hook side-effect và state
import { Link, useSearchParams } from 'react-router-dom'; // Link điều hướng và hook đọc tham số trên URL (?q=...)
import { booksApi, categoriesApi } from '../api/services'; // API sách và thể loại

export default function Books() { // Trang tìm kiếm/danh sách sách
  const [searchParams] = useSearchParams(); // Lấy các tham số query trên URL
  const [q, setQ] = useState(searchParams.get('q') || ''); // State từ khóa (khởi tạo từ URL nếu có)
  const [categoryId, setCategoryId] = useState(''); // State thể loại đang lọc
  const [available, setAvailable] = useState(false); // State: chỉ hiện sách còn cho mượn?
  const [categories, setCategories] = useState([]); // State danh sách thể loại (cho dropdown)
  const [data, setData] = useState({ data: [], pagination: { page: 1, totalPages: 1 } }); // State kết quả tìm kiếm + phân trang
  const [page, setPage] = useState(1); // State trang hiện tại
  const [loading, setLoading] = useState(false); // State đang tải dữ liệu

  useEffect(() => { // Khi vào trang
    categoriesApi.list().then(setCategories).catch(() => {}); // Tải danh sách thể loại cho bộ lọc
  }, []); // Chỉ chạy 1 lần

  const load = async (p = page, term = q) => { // Hàm tải sách theo trang p và từ khóa term
    setLoading(true); // Bật trạng thái tải
    try { // Thử tải
      const params = { q: term, page: p, limit: 8 }; // Tham số: từ khóa, trang, 8 sách/trang
      if (categoryId) params.categoryId = categoryId; // Thêm lọc thể loại nếu có
      if (available) params.available = true; // Thêm lọc "còn sách" nếu bật
      const res = await booksApi.list(params); // Gọi API lấy danh sách
      setData(res); // Lưu kết quả
      setPage(p); // Cập nhật trang hiện tại
    } finally { // Dù sao
      setLoading(false); // Tắt trạng thái tải
    } // Kết thúc try
  }; // Kết thúc load

  // Tải lại khi từ khóa trên URL thay đổi (ô tìm kiếm ở thanh trên cùng).
  const urlQ = searchParams.get('q') || ''; // Lấy từ khóa hiện tại trên URL
  useEffect(() => { // Khi từ khóa URL đổi
    setQ(urlQ); // Đồng bộ ô tìm kiếm với URL
    load(1, urlQ); // Tải lại từ trang 1 với từ khóa mới
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQ]); // Phụ thuộc urlQ

  const onSearch = (e) => { // Hàm khi bấm nút Tìm
    e.preventDefault(); // Ngăn reload trang
    load(1); // Tải lại từ trang 1 với bộ lọc hiện tại
  }; // Kết thúc onSearch

  return ( // Giao diện
    <div className="container"> {/* Khung trang */}
      <h1 className="page-title">Tìm kiếm sách</h1> {/* Tiêu đề trang */}
      <form className="filters" onSubmit={onSearch}> {/* Khu vực bộ lọc */}
        <input placeholder="Tiêu đề / tác giả / ISBN..." value={q} onChange={(e) => setQ(e.target.value)} /> {/* Ô nhập từ khóa */}
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}> {/* Dropdown thể loại */}
          <option value="">-- Tất cả thể loại --</option> {/* Lựa chọn không lọc */}
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)} {/* Liệt kê thể loại */}
        </select> {/* Kết thúc dropdown */}
        <label className="checkbox"> {/* Ô tích "Còn sách" */}
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> Còn sách {/* Bật/tắt lọc còn sách */}
        </label> {/* Kết thúc checkbox */}
        <button className="btn btn-primary">Tìm</button> {/* Nút tìm */}
      </form> {/* Kết thúc bộ lọc */}

      {loading ? <p>Đang tải...</p> : ( // Đang tải -> hiện chữ chờ; xong -> hiện bảng
        <table className="table"> {/* Bảng kết quả */}
          <thead> {/* Phần tiêu đề bảng */}
            <tr><th>Tiêu đề</th><th>Tác giả</th><th>Thể loại</th><th>Còn / Tổng</th><th></th></tr> {/* Các cột */}
          </thead> {/* Kết thúc thead */}
          <tbody> {/* Phần thân bảng */}
            {data.data.map((b) => ( // Duyệt từng sách
              <tr key={b.id}> {/* Một dòng sách */}
                <td>{b.title}</td> {/* Tiêu đề */}
                <td>{b.author?.name || '-'}</td> {/* Tác giả (hoặc '-') */}
                <td>{b.category?.name || '-'}</td> {/* Thể loại */}
                <td> {/* Cột tình trạng */}
                  <span className={b.availableCopies > 0 ? 'badge ok' : 'badge danger'}> {/* Xanh nếu còn, đỏ nếu hết */}
                    {b.availableCopies}/{b.totalCopies} {/* Số còn / tổng */}
                  </span> {/* Kết thúc badge */}
                </td> {/* Kết thúc cột tình trạng */}
                <td><Link to={`/books/${b.id}`} className="btn btn-sm">Chi tiết</Link></td> {/* Nút sang trang chi tiết */}
              </tr> // Kết thúc dòng
            ))} {/* Kết thúc map sách */}
            {data.data.length === 0 && <tr><td colSpan="5" className="muted">Không có sách phù hợp.</td></tr>} {/* Thông báo khi không có kết quả */}
          </tbody> {/* Kết thúc tbody */}
        </table> // Kết thúc bảng
      )} {/* Kết thúc nhánh loading */}

      <div className="pagination"> {/* Khu vực phân trang */}
        <button className="btn btn-sm" disabled={page <= 1} onClick={() => load(page - 1)}>← Trước</button> {/* Trang trước (khóa nếu đang ở trang 1) */}
        <span>Trang {data.pagination.page}/{data.pagination.totalPages}</span> {/* Hiển thị trang hiện tại/tổng */}
        <button className="btn btn-sm" disabled={page >= data.pagination.totalPages} onClick={() => load(page + 1)}>Sau →</button> {/* Trang sau (khóa nếu đã ở trang cuối) */}
      </div> {/* Kết thúc phân trang */}
    </div> // Kết thúc container
  ); // Kết thúc return
} // Kết thúc Books
