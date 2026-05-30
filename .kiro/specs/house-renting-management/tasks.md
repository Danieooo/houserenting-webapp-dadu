# Implementation & Improvement Plan

## Completed Phases (Đã Hoàn Thành)

- [x] **1. Setup dự án Monorepo**
  - Cấu hình lại thư mục monorepo với `/frontend` và `/backend`.
  - Cài đặt toàn bộ dependencies cần thiết ở cả 2 phía bao gồm Express, Prisma ORM, React, Vite, Zustand, TanStack Query, shadcn/ui.
  - _Requirements: [R1.3, R6.1]_

- [x] **2. Thiết kế và Khởi tạo Cơ sở dữ liệu**
  - Thiết kế Prisma Schema hoàn chỉnh trên PostgreSQL (Neon serverless).
  - Viết script `seed.js` tạo sẵn tài khoản quản trị mặc định (`admin@test.com` / `password123`) và 3 phòng trọ mẫu.
  - Thực hiện migrations thành công trên Neon PostgreSQL.
  - _Requirements: [R1.2, R2.3, R3.1]_

- [x] **3. Hiện thực hóa Module Xác thực (Auth Backend & Frontend)**
  - Viết Express API cho Register, Login, Logout, Refresh Token, Get Me.
  - Thiết kế Zustand Store lưu trữ Access Token trong bộ nhớ RAM, Refresh Token và user ở localStorage.
  - Cài đặt Axios Interceptor tự động làm mới token âm thầm (Silent Refresh) khi gặp lỗi 401.
  - Thiết kế trang Đăng nhập trực quan sử dụng Tailwind CSS.
  - _Requirements: [R6.1, R6.2]_

- [x] **4. Module Quản lý Phòng trọ (Rooms Backend & Frontend)**
  - Viết các API CRUD đầy đủ cho Phòng trọ ràng buộc nghiêm ngặt theo `userId`.
  - Thiết kế trang Danh sách phòng trọ dạng bảng dữ liệu kèm huy hiệu trạng thái, Dialog modal thêm/sửa nhanh phòng trọ.
  - Xây dựng trang Chi tiết phòng hiển thị lịch sử hóa đơn và người thuê hiện tại.
  - _Requirements: [R1.1, R1.2, R1.3]_

- [x] **5. Module Quản lý Khách thuê & Upload tài liệu (Tenants Backend & Frontend)**
  - Viết API CRUD khách thuê tích hợp Upload tệp ảnh CCCD/Hợp đồng lên dịch vụ đám mây Cloudinary.
  - Thiết kế trang Danh sách khách thuê dạng lưới thẻ hiện đại, bộ lọc nhanh theo hoạt động/không hoạt động.
  - Xây dựng trang Chi tiết khách thuê tích hợp Dropzone upload tài liệu và quy trình Trả phòng an toàn (Soft Delete).
  - _Requirements: [R2.1, R2.2, R2.3, R2.4, R2.5]_

- [x] **6. Thuật toán Tính tiền & Hóa đơn hàng tháng (Invoices Backend & Frontend)**
  - Hiện thực thuật toán tính tiền phòng Pro-rata (chia theo ngày lẻ thực tế) và tính tiền điện/nước dựa trên chỉ số thực tế trên backend.
  - Xây dựng API tạo hóa đơn đơn lẻ và ghi nhận thanh toán linh hoạt (`paidAmount` đối soát `totalAmount`).
  - Thiết kế trang Danh sách hóa đơn, bộ lọc nâng cao theo tháng/năm/phòng/thanh toán.
  - _Requirements: [R3.1, R3.2, R3.4]_

- [x] **7. Giao diện Tạo hóa đơn hàng loạt (Bulk Invoice Creator)**
  - Xây dựng Express API quét các phòng OCCUPIED, tự động sao chép chỉ số điện nước mới tháng trước thành chỉ số cũ tháng này.
  - Thiết kế màn hình tạo hóa đơn hàng loạt cho phép nhập nhanh chỉ số mới trên cùng một giao diện và tạo toàn bộ chỉ với 1 click.
  - _Requirements: [R3.3]_

- [x] **8. Xuất và xem trước PDF hóa đơn (PDF Service)**
  - Tích hợp thư viện `pdf-lib` tạo mẫu PDF hóa đơn chuyên nghiệp phía backend, nhúng font Segoe UI TTF hiển thị trọn vẹn tiếng Việt Unicode.
  - Tích hợp QR Code động chuyển khoản VietQR dựa trên cấu hình Settings của chủ trọ.
  - Thiết kế UI Previewer cho phép xem trực tiếp PDF trên trình duyệt trước khi tải xuống.
  - _Requirements: [R3.5]_

- [x] **9. Báo cáo & Bảng điều khiển (Dashboard Backend & Frontend)**
  - Viết 5 API endpoints thống kê dữ liệu tài chính, công suất và cảnh báo.
  - Xây dựng giao diện Dashboard hiển thị 4 Stat Cards, 2 Alert Lists (phòng nợ tiền và hợp đồng sắp hết hạn).
  - Vẽ biểu đồ cột doanh thu 6 tháng và biểu đồ đường lấp đầy phòng bằng thư viện `Recharts` tự động co giãn.
  - _Requirements: [R4.1, R4.2, R4.3, R4.4]_

- [x] **10. Cấu hình hệ thống & Tránh ngủ đông free-tier (Settings & Keep-alive)**
  - Xây dựng giao diện cấu hình thông tin nhà trọ, logo thương hiệu, và thông tin tài khoản ngân hàng.
  - Tích hợp nút xuất dữ liệu hóa đơn toàn năm ra tệp CSV.
  - Viết API `/api/health` công khai và thiết lập cron-job.org ping định kỳ 14 phút giữ server Render luôn thức.
  - _Requirements: [R5.1, R5.2, R3.6, R6.3]_

---

## Future Improvements (Kế Hoạch Nâng Cấp Hệ Thống)

Dưới đây là danh sách các cải tiến tương lai nhằm đưa ứng dụng đạt chất lượng thương mại xuất sắc theo đúng quy trình **Spec-driven**:

### Task 11: Đánh giá & Khắc phục Vi phạm Heuristic UI/UX (Heuristic Polish)
- [x] Thực hiện kiểm duyệt Heuristic giao diện (bằng subagent `heuristic-auditor` hoặc đánh giá thủ công) trên toàn bộ 6 màn hình chính.
- [x] Khắc phục toàn bộ các lỗi Heuristic nghiêm trọng (Severity từ 2 trở lên):
  - Đảm bảo hiển thị Skeleton loading mượt mà cho tất cả các bảng dữ liệu khi đang fetch, loại bỏ hoàn toàn cảm giác giật lag màn hình.
  - Cải tiến thông báo Toast lỗi tiếng Việt chi tiết từ API thay vì hiển thị chung chung.
  - Đảm bảo kích thước tap target của mọi nút bấm trên thiết bị di động đạt tối thiểu $48\text{px} \times 48\text{px}$.
- [ ] _Requirements: [R6.3]_

### Task 12: Kiểm duyệt & Tối ưu hóa giao diện đa thiết bị (Responsive Polish)
- [x] Chạy audit visual đa thiết bị (sử dụng `responsive-visual-reviewer`) ở 3 viewport: Desktop (1280px), Tablet (768px), và Mobile (375px).
- [x] Sửa đổi mã nguồn CSS/Tailwind để khắc phục các lỗi:
  - Loại bỏ hoàn toàn lỗi tràn viền và xuất hiện thanh cuộn ngang (`overflow-x`) trên di động ở tất cả các trang, đặc biệt là trang Hóa đơn và Dashboard.
  - Tối ưu biểu đồ Recharts trên màn hình Mobile (tự co giãn thông qua `ResponsiveContainer` và giảm bớt số lượng nhãn trục X để tránh chồng chéo chữ).
- [ ] _Requirements: [R1.1, R4.3, R4.4]_

### Task 13: Xây dựng Kịch bản Kiểm thử tự động (UI Automation Testing)
- [x] Khởi tạo thư viện kiểm thử Playwright trong dự án.
- [x] Viết các kịch bản kiểm thử tích hợp tự động cho luồng Happy Path cốt lõi:
  - Luồng Đăng nhập -> Tạo phòng trọ -> Thêm khách thuê mới (kiểm tra trạng thái phòng tự động chuyển sang OCCUPIED).
  - Luồng Tạo hóa đơn hàng loạt -> Nhập chỉ số điện nước mới -> Ghi nhận thanh toán hóa đơn.
  - Luồng Trả phòng (kiểm tra trạng thái phòng tự động quay về AVAILABLE).
- [x] Thiết lập chạy test tự động Playwright trên môi trường local trước mỗi lượt commit.
- [x] _Requirements: [R6.2, R1.2, R2.2, R3.3, R3.4]_

### Task 14: Cải tiến PDF & Trình biên soạn Hóa đơn phía Client (Client-Side PDF generation)
- [ ] Thử nghiệm dịch chuyển logic tạo PDF hóa đơn từ Backend sang Frontend sử dụng thư viện `@react-pdf/renderer` hoặc `jspdf`.
- [ ] Giúp giảm tải đáng kể cho backend server Render free-tier, hạn chế tối đa lỗi trễ thời gian (timeout) khi tạo file PDF.
- [ ] Cho phép chủ trọ tùy biến trực quan mẫu thiết kế hóa đơn (đổi màu sắc chủ đạo, thêm ghi chú chân trang) trước khi bấm in.
- [ ] _Requirements: [R3.5, R5.1]_

### Task 15: Sao lưu tự động & Nhắc nhở đóng tiền thông minh (Auto Backup & Notifications)
- [x] Viết kịch bản GitHub Actions tự động gọi API sao lưu hàng ngày (`daily-backup.yml`) lúc 2:00 AM, xuất dữ liệu database Neon PostgreSQL thành tệp SQL/CSV và tự động tải lên Google Drive của chủ trọ thông qua Google API Service Account.
- [x] Nghiên cứu tích hợp nút bấm "Gửi thông báo hóa đơn" qua webhook Zalo ZNS hoặc SMS (sử dụng các API gửi tin nhắn miễn phí hoặc trả phí rẻ) để chủ trọ chỉ cần click là khách thuê nhận được tin nhắn báo tiền nhà kèm link xem hóa đơn chi tiết.
- [x] _Requirements: [R3.6, R4.2]_

### Task 16: Cải tiến tiêu chuẩn VietQR & Viết kịch bản kiểm thử mã QR (VietQR Standards & QR Testing)
- [x] Nâng cấp hàm `buildVietQRString` trong `pdfController.js` tuân thủ 100% tiêu chuẩn EMVCo MPM và Napas (thêm Tag 52, 59, 60, động hóa Tag 01, làm tròn số tiền Tag 54, chuẩn hóa mô tả Tag 62 sub-tag 08).
- [x] Viết kịch bản kiểm thử đơn vị (`pdfController.test.js` hoặc `test-qr.js`) chạy bằng Node.js ở backend để tự động xác thực giải thuật phân tích (`parsePaymentInfo`) và sinh mã QR (`buildVietQRString`).
- [x] Tích hợp chạy tự động kiểm thử QR này khi chạy thử nghiệm hoặc kiểm tra E2E.
- [x] Bổ sung bước kiểm duyệt E2E Playwright để xác nhận giao diện chi tiết hóa đơn có hiển thị đầy đủ thông tin hướng dẫn QR và API tải PDF hoạt động đúng chuẩn.
- [x] _Requirements: [R3.5]_

