import { useEffect, useState } from 'react';
import { booksApi, categoriesApi, authorsApi } from '../api/services';

const EMPTY = { title: '', isbn: '', categoryId: '', authorId: '', publisher: '', publishedYear: '', totalCopies: 1, description: '' };

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    const res = await booksApi.list({ limit: 100 });
    setBooks(res.data);
  };
  useEffect(() => {
    load();
    categoriesApi.list().then(setCategories);
    authorsApi.list().then(setAuthors);
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        authorId: form.authorId ? Number(form.authorId) : null,
        publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
        totalCopies: Number(form.totalCopies),
      };
      if (editingId) {
        await booksApi.update(editingId, payload);
        setMsg('Đã cập nhật sách.');
      } else {
        await booksApi.create(payload);
        setMsg('Đã thêm sách.');
      }
      setForm(EMPTY); setEditingId(null);
      load();
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const edit = (b) => {
    setEditingId(b.id);
    setForm({
      title: b.title, isbn: b.isbn || '', categoryId: b.category?.id || '', authorId: b.author?.id || '',
      publisher: b.publisher || '', publishedYear: b.publishedYear || '', totalCopies: b.totalCopies, description: b.description || '',
    });
  };

  const setCopies = async (b) => {
    const v = prompt(`Tổng số bản mới cho "${b.title}":`, b.totalCopies);
    if (v == null) return;
    setErr('');
    try { await booksApi.setCopies(b.id, Number(v)); load(); } catch (e) { setErr(e.message); }
  };

  const remove = async (b) => {
    if (!confirm(`Xóa "${b.title}"?`)) return;
    setErr('');
    try { await booksApi.remove(b.id); load(); } catch (e) { setErr(e.message); }
  };

  return (
    <div className="container">
      <h1 className="page-title">Quản lý đầu sách</h1>
      {err && <div className="alert error">{err}</div>}
      {msg && <div className="alert ok">{msg}</div>}

      <form className="card form-grid" onSubmit={submit}>
        <h3>{editingId ? 'Sửa sách' : 'Thêm sách mới'}</h3>
        <input name="title" placeholder="Tiêu đề *" value={form.title} onChange={onChange} required />
        <input name="isbn" placeholder="ISBN" value={form.isbn} onChange={onChange} />
        <select name="categoryId" value={form.categoryId} onChange={onChange}>
          <option value="">-- Thể loại --</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="authorId" value={form.authorId} onChange={onChange}>
          <option value="">-- Tác giả --</option>
          {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input name="publisher" placeholder="NXB" value={form.publisher} onChange={onChange} />
        <input name="publishedYear" placeholder="Năm XB" type="number" value={form.publishedYear} onChange={onChange} />
        <input name="totalCopies" placeholder="Số bản" type="number" min="1" value={form.totalCopies} onChange={onChange} />
        <input name="description" placeholder="Mô tả" value={form.description} onChange={onChange} />
        <div className="actions">
          <button className="btn btn-primary">{editingId ? 'Lưu' : 'Thêm'}</button>
          {editingId && <button type="button" className="btn" onClick={() => { setForm(EMPTY); setEditingId(null); }}>Hủy</button>}
        </div>
      </form>

      <table className="table">
        <thead>
          <tr><th>Tiêu đề</th><th>Thể loại</th><th>Còn/Tổng</th><th>Thao tác</th></tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.category?.name || '-'}</td>
              <td>{b.availableCopies}/{b.totalCopies}</td>
              <td className="actions">
                <button className="btn btn-sm" onClick={() => edit(b)}>Sửa</button>
                <button className="btn btn-sm" onClick={() => setCopies(b)}>Số bản</button>
                <button className="btn btn-sm" onClick={() => remove(b)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
