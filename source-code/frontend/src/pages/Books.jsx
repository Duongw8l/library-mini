import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { booksApi, categoriesApi } from '../api/services';

export default function Books() {
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState('');
  const [available, setAvailable] = useState(false);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  const load = async (p = page, term = q) => {
    setLoading(true);
    try {
      const params = { q: term, page: p, limit: 8 };
      if (categoryId) params.categoryId = categoryId;
      if (available) params.available = true;
      const res = await booksApi.list(params);
      setData(res);
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  // Tải lại khi từ khóa trên URL thay đổi (ô tìm kiếm ở thanh trên cùng).
  const urlQ = searchParams.get('q') || '';
  useEffect(() => {
    setQ(urlQ);
    load(1, urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQ]);

  const onSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  return (
    <div className="container">
      <h1 className="page-title">Tìm kiếm sách</h1>
      <form className="filters" onSubmit={onSearch}>
        <input placeholder="Tiêu đề / tác giả / ISBN..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">-- Tất cả thể loại --</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="checkbox">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> Còn sách
        </label>
        <button className="btn btn-primary">Tìm</button>
      </form>

      {loading ? <p>Đang tải...</p> : (
        <table className="table">
          <thead>
            <tr><th>Tiêu đề</th><th>Tác giả</th><th>Thể loại</th><th>Còn / Tổng</th><th></th></tr>
          </thead>
          <tbody>
            {data.data.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.author?.name || '-'}</td>
                <td>{b.category?.name || '-'}</td>
                <td>
                  <span className={b.availableCopies > 0 ? 'badge ok' : 'badge danger'}>
                    {b.availableCopies}/{b.totalCopies}
                  </span>
                </td>
                <td><Link to={`/books/${b.id}`} className="btn btn-sm">Chi tiết</Link></td>
              </tr>
            ))}
            {data.data.length === 0 && <tr><td colSpan="5" className="muted">Không có sách phù hợp.</td></tr>}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button className="btn btn-sm" disabled={page <= 1} onClick={() => load(page - 1)}>← Trước</button>
        <span>Trang {data.pagination.page}/{data.pagination.totalPages}</span>
        <button className="btn btn-sm" disabled={page >= data.pagination.totalPages} onClick={() => load(page + 1)}>Sau →</button>
      </div>
    </div>
  );
}
