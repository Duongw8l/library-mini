# Retrospective — Hệ thống Quản lý Thư viện Mini

> **Tài liệu:** `retrospective.md` — Đánh giá & Bài học kinh nghiệm (cập nhật cuối dự án)
> **Phiên bản:** 1.0 — 2026-06-29

---

## 1. Tóm tắt dự án

Xây dựng Hệ thống Quản lý Thư viện Mini theo phương pháp **Spec-Driven Development (SDD)**,
với sự hỗ trợ của AI (Claude, GitHub Copilot, Speckit). Sản phẩm gồm backend Node.js/Express +
PostgreSQL/Prisma, frontend React, và bộ tài liệu — kiểm thử — minh chứng AI đầy đủ.

## 2. Đánh giá quy trình SDD

| Bước SDD | Thực hiện | Nhận xét |
|----------|-----------|----------|
| Problem | `spec.md` §1 | Bài toán rõ, bám sát đề bài đề tài 6 |
| Specification | `spec.md`, `requirements.md` | Đặc tả FR/BR/NFR có mã truy vết |
| Planning | `plan.md` | Chia 9 milestone M0–M8 hợp lý |
| Task Breakdown | `task.md` | Task gắn với FR & test case |
| AI-assisted Dev | `ai-artifacts/` | Code khung do AI sinh, người review |
| Testing | `test-plan.md`, `testing/` | Test case bám BR; tự động + thủ công |
| Evaluation | `test-report` | Đo tỷ lệ pass, coverage |
| Documentation | toàn bộ `docs/` | Tài liệu đồng bộ với code |

## 3. Điều làm tốt (What went well)

- **Spec đi trước code** giúp giảm sửa đổi lớn về sau; AI sinh code bám sát spec.
- Quy tắc nghiệp vụ (BR-01..09) được định nghĩa sớm → test case rõ ràng.
- Tách lớp controller/service/repository giúp test và bảo trì dễ.
- Dùng transaction cho mượn/trả đảm bảo nhất quán `available_copies`.

## 4. Khó khăn & cách xử lý (Challenges)

| Khó khăn | Cách xử lý |
|----------|-----------|
| Code AI sinh đôi khi thiếu validate đầu vào | Thêm tầng validate + review thủ công |
| Tính quá hạn lệ thuộc múi giờ | Chuẩn hóa UTC, test mốc thời gian biên |
| Đồng bộ `available_copies` khi nhiều thao tác | Bọc trong `prisma.$transaction` |
| Phạm vi dễ phình | Bám sát danh mục Must-have của `requirements.md` |

## 5. Đánh giá vai trò AI (AI Engineering Evaluation)

| Tiêu chí | Nhận xét |
|----------|----------|
| Tốc độ sinh khung code | Nhanh, tiết kiệm thời gian boilerplate |
| Chất lượng logic nghiệp vụ | Khá, cần review các điều kiện biên |
| Độ chính xác theo spec | Cao khi prompt kèm spec/BR cụ thể |
| Rủi ro | Code chạy được nhưng có thể thiếu kiểm tra lỗi → bắt buộc review + test |

**Kết luận:** AI hiệu quả nhất khi được cung cấp **spec rõ ràng**; con người vẫn chịu
trách nhiệm review, kiểm thử và quyết định cuối cùng.

## 6. Bài học kinh nghiệm (Lessons Learned)

1. Đầu tư viết spec/BR chi tiết → AI sinh code đúng hơn, test dễ hơn.
2. Luôn kèm ngữ cảnh (spec, ràng buộc) vào prompt thay vì yêu cầu chung chung.
3. Test nghiệp vụ (đặc biệt biên) quan trọng hơn test "happy path".
4. Tài liệu và code phải cập nhật đồng bộ — coi docs là một phần của sản phẩm.

## 7. Hướng phát triển tiếp theo (Future Work)

- Đặt giữ sách (reservation) khi hết bản.
- Nhắc hạn qua email/thông báo thật.
- Quét mã vạch/QR cho mượn — trả.
- Thống kê nâng cao bằng biểu đồ & dashboard realtime.
- Phân quyền chi tiết hơn (permission-based thay role-based).

## 8. Số liệu tổng kết (điền sau khi kiểm thử)

| Chỉ số | Giá trị |
|--------|---------|
| Số API endpoint | ~36 (8 nhóm module) |
| Số test case (tài liệu) | 32 (test-cases.xlsx) |
| Unit test tự động | 13/13 PASS |
| Tỷ lệ pass test case | 100% (≥ ngưỡng 90%) |
| Số bug phát hiện / đã sửa | 8 / 8 (bug-report.xlsx) |
