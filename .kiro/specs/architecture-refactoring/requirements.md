# Requirements Document

## Introduction

Spec này bao gồm 12 khuyến nghị tái cấu trúc được xác định trong `ARCHITECTURE_REVIEW.md` cho ứng dụng quản lý nhà trọ (phiên bản 1.4.5). Các yêu cầu được nhóm theo 3 mức độ ưu tiên: **P1 — Sửa ngay (Lỗi tính đúng đắn)**, **P2 — Giá trị cao, rủi ro thấp**, và **P3 — Cải tiến cấu trúc**.

Người dùng trong các User Story là **developer/maintainer** của codebase, không phải chủ trọ cuối.

---

## Glossary

- **TenantFile**: Bản ghi trong bảng `TenantFile` của Prisma, lưu thông tin file tài liệu của khách thuê.
- **Cloudinary**: Dịch vụ lưu trữ file ảnh/PDF trên đám mây. Mỗi file có `secure_url` và `public_id` riêng biệt.
- **publicId**: Định danh duy nhất của một file trên Cloudinary, cần thiết để xóa file khỏi storage.
- **bulkCreateInvoices**: Endpoint `POST /api/invoices/bulk` tạo hóa đơn hàng loạt cho tất cả phòng đang có người thuê trong một tháng.
- **Transaction**: Giao dịch cơ sở dữ liệu đảm bảo tính nguyên tử — toàn bộ thành công hoặc toàn bộ thất bại.
- **ensureDatabaseSchema**: Hàm trong `index.js` chạy lệnh `ALTER TABLE` mỗi khi server khởi động.
- **DDL**: Data Definition Language — các lệnh SQL thay đổi cấu trúc bảng (ALTER TABLE, CREATE TABLE...).
- **Prisma Migration**: Cơ chế quản lý thay đổi schema cơ sở dữ liệu chính thức của Prisma ORM.
- **N+1 Query**: Vấn đề hiệu năng khi thực hiện N truy vấn riêng lẻ thay vì 1 truy vấn tổng hợp.
- **getRevenueChart**: Endpoint `GET /api/dashboard/revenue` trả về dữ liệu doanh thu 6 tháng gần nhất.
- **getOccupancyChart**: Endpoint `GET /api/dashboard/occupancy` trả về tỷ lệ lấp đầy phòng 6 tháng gần nhất.
- **Zod**: Thư viện validation schema cho TypeScript/JavaScript.
- **Validate_Middleware**: Middleware Express tái sử dụng được, nhận một Zod schema và trả về lỗi 400 nếu request body không hợp lệ.
- **authMiddleware**: Middleware Express xác thực JWT và gán thông tin user vào `req.user`.
- **JWT**: JSON Web Token — token xác thực chứa payload được ký bằng secret key.
- **pdfController**: File `backend/src/controllers/pdfController.js` hiện chứa logic PDF, VietQR, và CRC-16.
- **pdfService**: Module mới `backend/src/services/pdfService.js` chứa logic layout và render PDF.
- **vietQrService**: Module mới `backend/src/services/vietQrService.js` chứa `parsePaymentInfo`, `buildVietQRString`, `bankBinMap`.
- **crc16**: Module mới `backend/src/utils/crc16.js` chứa thuật toán CRC-16/CCITT.
- **calculateTotal**: Hàm thuần túy trong `invoiceService.js` tính tổng tiền hóa đơn theo pro-rata.
- **InvoiceService**: Module `backend/src/services/invoiceService.js`.
- **Pagination**: Cơ chế phân trang trả về tập con dữ liệu theo `page` và `limit`.
- **WakeUpBanner**: Component React `frontend/src/components/WakeUpBanner.jsx` hiển thị banner khi server đang khởi động.
- **ROOM_STATUS_COLORS**: Hằng số trong `frontend/src/lib/utils.js` hiện không được sử dụng ở bất kỳ đâu trong codebase.
- **LoginPage**: Component React `frontend/src/pages/LoginPage.jsx`.
- **Demo_Credentials**: Thông tin tài khoản demo (`admin@test.com` / `password123`) hiển thị trên LoginPage.

---

## Requirements

---

## Nhóm P1 — Sửa ngay (Lỗi tính đúng đắn)

---

### Requirement 1: Sửa lỗi file Cloudinary bị bỏ lại (R1)

**User Story:** Là developer, tôi muốn mỗi file upload lên Cloudinary đều được xóa khỏi storage khi bản ghi DB bị xóa, để tránh tích lũy file mồ côi gây tốn dung lượng Cloudinary miễn phí.

#### Acceptance Criteria

1. WHEN developer upload file cho khách thuê, THE TenantFile SHALL lưu trường `publicId` chứa giá trị `result.public_id` từ kết quả trả về của Cloudinary.
2. WHEN developer xóa một `TenantFile`, THE System SHALL gọi `deleteFromCloudinary(file.publicId)` trước khi thực hiện `prisma.tenantFile.delete()`.
2a. IF `deleteFromCloudinary` thất bại (lỗi mạng hoặc lỗi Cloudinary API), THEN THE System SHALL dừng toàn bộ thao tác xóa, không xóa bản ghi DB, và trả về lỗi cho client.
3. IF `publicId` của một `TenantFile` là `null` hoặc rỗng, THEN THE System SHALL vẫn xóa bản ghi DB và ghi log cảnh báo thay vì trả về lỗi.
4. THE Prisma_Schema SHALL thêm trường `publicId String?` vào model `TenantFile` và tạo migration tương ứng.
5. WHEN developer xóa một khách thuê (cascade delete), THE System SHALL gọi `deleteFromCloudinary` cho từng `TenantFile` liên quan trước khi xóa các bản ghi DB.

---

### Requirement 2: Đảm bảo tính nguyên tử cho `bulkCreateInvoices` (R2)

**User Story:** Là developer, tôi muốn thao tác tạo hóa đơn hàng loạt là nguyên tử, để nếu có lỗi xảy ra giữa chừng thì không có hóa đơn nào được tạo ra một phần, tránh trạng thái dữ liệu không nhất quán.

#### Acceptance Criteria

1. WHEN developer gọi `bulkCreateInvoices` cho N phòng, THE InvoiceController SHALL bọc toàn bộ vòng lặp tạo hóa đơn trong một `prisma.$transaction()` duy nhất.
2. IF bất kỳ thao tác `prisma.invoice.create()` nào trong transaction thất bại, THEN THE System SHALL rollback toàn bộ transaction và không có hóa đơn nào được lưu vào database.
3. WHEN transaction thành công, THE System SHALL trả về danh sách đầy đủ các hóa đơn đã tạo với `created.length === số phòng hợp lệ`.
3a. IF transaction thất bại, THEN THE System SHALL trả về thông tin về thao tác đã được thử (số phòng được xử lý, lý do thất bại) trong response lỗi, không trả về dữ liệu hóa đơn.
4. THE bulkCreateInvoices SHALL đảm bảo tính bất biến: tổng số hóa đơn trong DB trước và sau một lần gọi thất bại phải bằng nhau.

**Thuộc tính kiểm thử (Property-Based Test):**
- *Invariant nguyên tử*: Với bất kỳ tập N phòng nào, nếu transaction thất bại tại bước thứ k (1 ≤ k ≤ N), số lượng hóa đơn trong DB phải bằng số lượng trước khi gọi (không tăng thêm).

---

### Requirement 3: Xóa DDL runtime khỏi `index.js` (R3)

**User Story:** Là developer, tôi muốn server không chạy lệnh `ALTER TABLE` mỗi khi khởi động, để tránh lỗi tiềm ẩn trong môi trường production có quyền DB hạn chế và để tuân thủ quy trình migration chuẩn của Prisma.

#### Acceptance Criteria

1. THE System SHALL xóa hoàn toàn hàm `ensureDatabaseSchema()` và lời gọi của nó khỏi `backend/src/index.js`.
2. THE Server SHALL khởi động mà không thực thi bất kỳ lệnh DDL nào (`ALTER TABLE`, `CREATE TABLE`, `DROP TABLE`).
3. THE Prisma_Schema SHALL đảm bảo cột `paymentInfo` đã tồn tại trong migration `20260428000000_add_payment_info` và được quản lý hoàn toàn qua `prisma migrate`.
4. WHEN developer chạy `prisma migrate deploy` trong pipeline CI/CD, THE System SHALL áp dụng migration `add_payment_info` để đảm bảo cột `paymentInfo` tồn tại trước khi server khởi động.
4a. IF migration `add_payment_info` chưa được áp dụng khi server khởi động, THE Server SHALL vẫn khởi động và xử lý lỗi thiếu cột một cách graceful tại runtime thay vì crash.
4b. IF migration deployment thất bại trong CI/CD pipeline, THEN THE deployment process SHALL ghi log lỗi rõ ràng để developer biết cần can thiệp thủ công.

---

## Nhóm P2 — Giá trị cao, rủi ro thấp

---

### Requirement 4: Loại bỏ N+1 query trong dashboard chart (R4)

**User Story:** Là developer, tôi muốn các endpoint chart dashboard thực hiện một truy vấn tổng hợp duy nhất thay vì 6 truy vấn tuần tự, để giảm độ trễ dashboard trên kết nối Neon serverless.

#### Acceptance Criteria

1. THE getRevenueChart SHALL thay thế vòng lặp 6 lần `prisma.invoice.findMany()` bằng một truy vấn `prisma.$queryRaw` hoặc `prisma.invoice.groupBy()` duy nhất nhóm theo `month` và `year`.
2. THE getOccupancyChart SHALL thay thế vòng lặp 6 lần `prisma.invoice.findMany()` bằng một truy vấn tổng hợp duy nhất.
3. WHEN developer gọi `GET /api/dashboard/revenue`, THE System SHALL thực hiện tối đa 1 truy vấn database (không tính truy vấn xác thực user nếu còn tồn tại).
4. WHEN developer gọi `GET /api/dashboard/occupancy`, THE System SHALL thực hiện tối đa 2 truy vấn database (1 đếm tổng phòng + 1 tổng hợp hóa đơn).
5. THE getRevenueChart và getOccupancyChart SHALL trả về dữ liệu có cấu trúc giống hệt với implementation hiện tại để không phá vỡ frontend.

**Thuộc tính kiểm thử (Property-Based Test):**
- *Model-based testing*: Với bất kỳ tập dữ liệu hóa đơn nào, kết quả từ truy vấn tổng hợp mới phải bằng kết quả từ vòng lặp 6 truy vấn cũ (tổng doanh thu theo tháng, tỷ lệ lấp đầy theo tháng).

---

### Requirement 5: Thêm Zod validation middleware cho backend (R5)

**User Story:** Là developer, tôi muốn tất cả request body đến các endpoint quan trọng đều được validate bằng Zod schema trước khi vào controller, để phát hiện sớm dữ liệu không hợp lệ và trả về lỗi nhất quán.

#### Acceptance Criteria

1. THE System SHALL tạo file `backend/src/middlewares/validate.js` chứa hàm `validate(schema)` nhận một Zod schema và trả về Express middleware.
2. WHEN request body không hợp lệ theo schema, THE Validate_Middleware SHALL trả về HTTP 400 với `{ success: false, code: 'VALIDATION_ERROR', errors: result.error.flatten() }`.
2a. THE Validate_Middleware SHALL trả về HTTP 400 cho cả lỗi kiểu dữ liệu (sai type), lỗi thiếu trường bắt buộc, và lỗi vi phạm business rule được định nghĩa trong schema (ví dụ: `electricityNow < electricityPrev`).
3. WHEN request body hợp lệ, THE Validate_Middleware SHALL gán `req.body = result.data` (dữ liệu đã được parse và coerce bởi Zod) rồi gọi `next()`.
4. THE System SHALL định nghĩa và áp dụng Zod schema cho các endpoint: `POST /api/rooms`, `PUT /api/rooms/:id`, `POST /api/tenants`, `POST /api/invoices`, `POST /api/invoices/bulk`, `PUT /api/settings`.
5. THE Room_Schema SHALL validate `baseRent` là số nguyên dương, `electricPrice` và `waterPrice` là số nguyên dương, `garbageFee` là số nguyên không âm.
6. THE Invoice_Schema SHALL validate `electricityNow >= electricityPrev` và `waterNow >= waterPrev` để ngăn chỉ số âm.
7. IF `webhookUrl` được cung cấp trong settings, THEN THE Settings_Schema SHALL validate đây là URL hợp lệ theo định dạng `https://...`.

**Thuộc tính kiểm thử (Property-Based Test):**
- *Error condition*: Với bất kỳ request body nào thiếu trường bắt buộc hoặc có giá trị sai kiểu, `Validate_Middleware` phải trả về HTTP 400 với `code: 'VALIDATION_ERROR'`.

---

### Requirement 6: Nhúng thông tin user vào JWT để loại bỏ DB lookup (R6)

**User Story:** Là developer, tôi muốn `authMiddleware` đọc thông tin user trực tiếp từ JWT payload thay vì truy vấn database, để giảm độ trễ cho mọi request được xác thực trên kết nối Neon serverless.

#### Acceptance Criteria

1. WHEN user đăng nhập thành công, THE authController SHALL tạo access token với payload `{ id, email, name }` thay vì chỉ `{ id }`.
2. THE authMiddleware SHALL gán `req.user = { id: decoded.id, email: decoded.email, name: decoded.name }` từ JWT payload mà không gọi `prisma.user.findUnique()`.
3. THE authMiddleware SHALL vẫn trả về HTTP 401 với `code: 'UNAUTHORIZED'` khi token không hợp lệ hoặc hết hạn.
4. IF token hợp lệ nhưng payload thiếu trường `email` hoặc `name` (token cũ trước khi refactor), THEN THE authMiddleware SHALL trả về HTTP 401 để buộc user đăng nhập lại.
5. THE System SHALL đảm bảo tất cả các endpoint hiện đang dùng `req.user.id`, `req.user.email`, `req.user.name` vẫn hoạt động đúng sau khi thay đổi.

**Thuộc tính kiểm thử (Property-Based Test):**
- *Round-trip*: Với bất kỳ user object `{ id, email, name }` nào, dữ liệu được nhúng vào JWT tại `authController` phải bằng dữ liệu được đọc ra từ JWT tại `authMiddleware`.

---

## Nhóm P3 — Cải tiến cấu trúc

---

### Requirement 7: Tách `pdfController.js` thành các module chuyên biệt (R7)

**User Story:** Là developer, tôi muốn logic PDF, VietQR và CRC-16 được tách thành các module riêng biệt, để dễ đọc, dễ test và dễ bảo trì từng phần độc lập.

#### Acceptance Criteria

1. THE System SHALL tạo file `backend/src/services/vietQrService.js` chứa `bankBinMap`, `parsePaymentInfo()`, và `buildVietQRString()`.
2. THE System SHALL tạo file `backend/src/utils/crc16.js` chứa thuật toán CRC-16/CCITT được tách ra từ `buildVietQRString`.
3. THE System SHALL tạo file `backend/src/services/pdfService.js` chứa logic layout và render PDF (font discovery, `drawText`, `drawRow`, QR embedding).
4. THE pdfController SHALL trở thành thin controller chỉ xử lý HTTP request/response, ủy quyền toàn bộ logic cho `pdfService` và `vietQrService`.
4a. THE pdfController SHALL chỉ được phép ủy quyền sau khi `pdfService.js` và `vietQrService.js` đã tồn tại và export đúng interface — không được import module chưa tồn tại.
5. WHEN developer gọi `GET /api/invoices/:id/pdf`, THE System SHALL tạo ra PDF có nội dung tương đương về mặt chức năng với implementation trước khi tách module (cùng layout, cùng dữ liệu, cùng QR code), dù cấu trúc nội bộ có thể thay đổi.
6. THE vietQrService SHALL export `parsePaymentInfo` và `buildVietQRString` để các test hiện có trong `pdfController.test.js` vẫn pass sau khi refactor.

---

### Requirement 8: Thêm unit test cho logic tính tiền `invoiceService.js` (R8)

**User Story:** Là developer, tôi muốn hàm `calculateTotal` có bộ unit test bao phủ các trường hợp biên, để tự tin refactor và phát hiện regression trong logic tính tiền pro-rata.

#### Acceptance Criteria

1. THE System SHALL cài đặt Vitest (hoặc Jest) vào `backend/package.json` như một `devDependency`.
2. THE System SHALL tạo file `backend/src/services/invoiceService.test.js` với các test case cho `calculateTotal`.
3. THE InvoiceService_Tests SHALL bao phủ trường hợp tháng đầy đủ (periodStart = ngày 1, periodEnd = ngày cuối tháng).
4. THE InvoiceService_Tests SHALL bao phủ trường hợp tháng không đầy đủ (pro-rata: ví dụ thuê từ ngày 15).
5. THE InvoiceService_Tests SHALL bao phủ trường hợp đồng hồ reset (`electricityNow < electricityPrev` — chỉ số điện về 0).
6. THE InvoiceService_Tests SHALL bao phủ trường hợp tháng 2 năm nhuận (29 ngày).
7. THE InvoiceService_Tests SHALL bao phủ trường hợp `baseRent = 0` (phòng miễn phí).
8. THE InvoiceService_Tests SHALL bao phủ trường hợp `otherFees` là số thập phân (ví dụ 50000.5).
9. WHEN developer chạy `npm test` trong thư mục `backend/`, THE System SHALL thực thi tất cả test và báo cáo kết quả pass/fail.

**Thuộc tính kiểm thử (Property-Based Test):**
- *Invariant*: Với bất kỳ input hợp lệ nào (`baseRent >= 0`, `electricityNow >= electricityPrev`, `waterNow >= waterPrev`, `garbageFee >= 0`, `otherFees >= 0`), `calculateTotal` phải trả về giá trị `>= 0`.
- *Metamorphic*: Kết quả của tháng đầy đủ phải `>=` kết quả của bất kỳ tháng không đầy đủ nào với cùng `baseRent` và cùng chỉ số điện/nước.

---

### Requirement 9: Thêm phân trang cho endpoint danh sách hóa đơn (R9)

**User Story:** Là developer, tôi muốn endpoint `GET /api/invoices` hỗ trợ phân trang, để tránh trả về toàn bộ lịch sử hóa đơn (có thể lên đến 1200+ bản ghi) trong một response duy nhất.

#### Acceptance Criteria

1. THE getInvoices SHALL chấp nhận query params `page` (mặc định `1`) và `limit` (mặc định `50`) bên cạnh các filter hiện có.
2. WHEN developer gọi `GET /api/invoices?page=2&limit=20`, THE System SHALL trả về tối đa 20 hóa đơn bắt đầu từ bản ghi thứ 21 (theo thứ tự sắp xếp hiện tại).
3. THE getInvoices SHALL trả về metadata phân trang trong response: `{ success: true, data: [...], meta: { total, page, limit, totalPages } }`.
4. IF `page` hoặc `limit` không phải số nguyên dương, THEN THE System SHALL sử dụng giá trị mặc định thay vì trả về lỗi.
5. THE System SHALL đảm bảo `limit` tối đa là `200` để ngăn query quá lớn.
6. WHEN `page` vượt quá `totalPages`, THE System SHALL trả về `data: []` và `meta` chính xác thay vì lỗi.
6a. WHEN không có hóa đơn nào trong database (hoặc không có hóa đơn nào khớp filter), THE System SHALL trả về `meta: { total: 0, page: 1, limit: <limit>, totalPages: 0 }` và `data: []` cho mọi giá trị `page`.

**Thuộc tính kiểm thử (Property-Based Test):**
- *Partition invariant*: Với bất kỳ tập N hóa đơn nào và `limit = L`, tổng số item trên tất cả các trang phải bằng N, và không có item nào xuất hiện trên hai trang khác nhau.

---

### Requirement 10: Ẩn thông tin demo credentials trong môi trường production (R10)

**User Story:** Là developer, tôi muốn thông tin tài khoản demo chỉ hiển thị trong môi trường development, để tránh lộ credentials trong production build.

#### Acceptance Criteria

1. THE LoginPage SHALL bọc khối hiển thị thông tin tài khoản demo trong điều kiện `import.meta.env.DEV`.
2. WHEN ứng dụng được build với `NODE_ENV=production` (hoặc `vite build`), THE LoginPage SHALL không render khối demo credentials trong HTML output.
2a. THE System SHALL chấp nhận rằng warning về unused export có thể tồn tại tạm thời do cache build tool và sẽ tự giải quyết ở lần build tiếp theo — không yêu cầu xóa cache thủ công.
3. WHEN ứng dụng chạy ở chế độ development (`vite dev`), THE LoginPage SHALL vẫn hiển thị khối demo credentials như hiện tại để tiện cho developer.

---

### Requirement 11: Sửa lỗi xử lý error trong `WakeUpBanner` (R11)

**User Story:** Là developer, tôi muốn `WakeUpBanner` tự ẩn sau tối đa 60 giây và xử lý đúng trường hợp health check thất bại, để banner không hiển thị vô thời hạn khi server không phản hồi.

#### Acceptance Criteria

1. THE WakeUpBanner SHALL thiết lập một timer tự động ẩn banner sau tối đa 60 giây kể từ khi banner xuất hiện.
2. WHEN health check API trả về lỗi (network error hoặc HTTP error), THE WakeUpBanner SHALL hiển thị banner (không nuốt lỗi im lặng như hiện tại).
3. WHEN health check API thành công trước 10 giây, THE WakeUpBanner SHALL không hiển thị banner (giữ nguyên behavior hiện tại).
4. WHEN health check API thành công sau khi banner đã hiển thị, THE WakeUpBanner SHALL ẩn banner ngay lập tức và hủy timer 60 giây đang chạy.
5. WHEN component bị unmount, THE WakeUpBanner SHALL hủy tất cả timer đang chạy để tránh memory leak.
6. THE WakeUpBanner SHALL hủy cả timer 60 giây khi health check thành công trước khi banner xuất hiện để tránh banner hiển thị không cần thiết.

---

### Requirement 12: Xóa dead code `ROOM_STATUS_COLORS` (R12)

**User Story:** Là developer, tôi muốn xóa hằng số `ROOM_STATUS_COLORS` không được sử dụng khỏi `utils.js`, để giảm kích thước bundle và tránh nhầm lẫn khi đọc code.

#### Acceptance Criteria

1. THE System SHALL xóa export `ROOM_STATUS_COLORS` khỏi `frontend/src/lib/utils.js`.
2. WHEN developer chạy build production (`vite build`), THE System SHALL không có warning về `ROOM_STATUS_COLORS` là unused export.
3. THE System SHALL đảm bảo không có file nào trong `frontend/src/` import hoặc sử dụng `ROOM_STATUS_COLORS` sau khi xóa.
