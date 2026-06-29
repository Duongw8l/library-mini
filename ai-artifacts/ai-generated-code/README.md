# AI-generated code (mẫu minh chứng)

Thư mục này lưu **bản chụp** một số đoạn mã do AI sinh ở bước AI-assisted Development,
phục vụ minh chứng. Code chính thức (đã review & tích hợp) nằm trong `source-code/`.

| File mẫu | Prompt nguồn | Ghi chú review của con người |
|----------|--------------|------------------------------|
| `loans.service.sample.js` | P-07 | Sửa tính phí phạt (BUG-01), thêm transaction cho approve (BUG-02) |
| `auth.middleware.sample.js` | P-08 | Thêm try/catch cho jwt.verify → token hết hạn trả 401 (BUG-04) |
| `loan.rules.sample.js` | P-10 | Tách hàm thuần để unit test không cần CSDL |

> So sánh các file `.sample.js` với bản trong `source-code/backend/src/` để thấy
> phần chỉnh sửa sau review.
