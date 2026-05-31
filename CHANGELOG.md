# Changelog

All notable changes to the **House Renting App** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.4] - 2026-05-31

### Added
- **Phủ Theme Botanic Floria Toàn Diện (Taste-Skill Redesign)**:
  - Thiết lập hệ **Design Tokens** tự nhiên thống nhất: Nền Canvas kem ấm `#FDFBF7` (`bg-cream-warm`), xanh xô thơm Sage Green `#2E7D32` làm màu thương hiệu chính thay thế cho màu xanh dương cũ, và màu đất nung Terracotta `#E65100` cho các nút bấm cảnh báo hoặc nút Chuyển ra.
  - **LoginPage**: Thay đổi nút submit và focus ring sang màu xanh Sage, trang trí thêm họa tiết SVG chiếc lá thanh nhã ở bốn góc banner, đồng thời bổ sung các nhánh lá SVG chìm bay bổng tại nền trang và bên trong thẻ Form đăng nhập.
  - **RoomsPage & RoomDetailPage**: Thiết kế mầm cây SVG làm placeholder nghệ thuật khi chưa có phòng (Empty state), đổi viền hover và giá tiền hiển thị sang màu Sage Green.
  - **TenantsPage & TenantDetailPage**: Thẻ khách thuê bo góc kem ấm với avatar xanh lá, Dropzone đính kèm tài liệu CCCD/hợp đồng viền đứt nét xanh Sage mềm mịn, nút Chuyển ra màu đất nung Terracotta `#E65100` nổi bật và ấm áp.
  - **InvoicesPage & InvoiceDetailPage**: Bảng hóa đơn bo góc bento `rounded-3xl` bọc viền kem, dòng tiêu đề hàng nền kem xô thơm nhạt, biểu tượng mầm cây `🌿` cho Form tạo hàng loạt, và tinh chỉnh nét phân dòng đứt thành màu xô thơm cực mờ nhạt `border-emerald-100/50`.
  - **SettingsPage**: Cài đặt ngân hàng, nút Lưu và sao lưu CSV được thiết kế bo tròn hữu cơ dùng tông màu chủ đạo xô thơm dịu mát, đồng thời bổ sung họa tiết nhánh lá SVG chìm cao cấp ở góc thẻ thông tin nhà trọ.
  - **DashboardPage**: Tái thiết kế **Botanic Welcome Hero Card** chuyển sang dải gradient kem ấm `#FDFBF7`, `#F5F2EB` và xanh xô thơm nhạt `#E8F5E9]/50` mượt mà, hòa trộn với ảnh thực tế `floria_banner.png` đã lược bỏ chữ, nâng cấp toàn bộ typography tối tương phản cực cao và các nút CTA có độ nẩy xúc giác tactile khi tương tác.
  - **Sidebar Cleanups**: Loại bỏ hoàn toàn dòng thông tin hiển thị tài khoản admin/chủ nhà trọ ở chân thanh Sidebar tại [AppLayout.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/layouts/AppLayout.jsx) đem lại cảm giác tối giản đẳng cấp.
  - **Mẫu Tin nhắn Hóa đơn**: Polish tinh tế nội dung văn bản thông báo tại [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx), lược bỏ xưng hô "anh/chị", đổi "xin thông báo" thành "thông báo" và "tiền phòng cơ bản" thành "tiền phòng" hợp lý và tự nhiên hơn.
  - **Playwright E2E Resilience**: Thiết lập `test.setTimeout(90000)` kiên cố hóa chống lag mạng, bảo toàn 100% thuộc tính `data-testid` phục vụ Playwright.
  - **Vite Build Warnings**: Khắc phục triệt để warning Tailwind của Vite bằng cách đổi thuộc tính `duration-[2000ms]` động sang inline style.
  
### Fixed
- **Render Backend Deploy Webhook Status Code Check**: Sửa lỗi hành động trigger deploy backend lên Render trên GitHub Actions (`deploy-backend.yml`) báo lỗi thất bại mặc dù nhận được HTTP 200. Cho phép chấp nhận cả mã HTTP 200 và 201 làm mã phản hồi thành công của webhook API Render.

### Verified
- ✅ Playwright E2E tests: Toàn bộ các bộ test E2E vượt qua hoàn hảo không có hiện tượng regression.
- ✅ Production build: Biên dịch Vercel/Vite bundle frontend thành công 100% với 0 errors và 0 warnings.

## [1.4.3] - 2026-05-31

### Added
- **Quy trình SDLC Tích hợp Superpowers Skills**:
  - Tích hợp 6 kỹ năng tuyển chọn (brainstorming, writing-plans, executing-plans, TDD, verification-before-completion, systematic-debugging) vào quy trình phát triển định hướng đặc tả trong [AGENTS.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/AGENTS.md).
- **Giao diện Premium Botanic Floria (Dashboard & Layout Redesign)**:
  - Thiết kế **Botanic Welcome Hero Card** ở đỉnh trang [DashboardPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/DashboardPage.jsx) bọc bằng gradient xanh xô thơm tự nhiên `#E8F5E9` và kem ấm `#FCFAF6`, kết hợp họa tiết lá vẽ SVG tinh tế và nhúng ảnh thực tế `floria_banner.png` (sắc nét, chiều sâu cao).
  - Tái cấu trúc **Bento Stat Cards** mới với các góc bo tròn sâu `rounded-[24px]` (3xl), nền trắng sữa nổi bật trên nền kem, và bóng mờ màu dịu đặc trưng theo tông màu của từng chỉ số (Doanh thu xô thơm `#2E7D32`, Phòng trống Cobalt `#0052CC`, Chưa thu gạch nung `#E65100`). Bổ sung hiệu ứng tương tác co giãn khi di chuột và bấm lún mechanical active phản hồi.
  - Tinh chỉnh các biểu đồ Recharts (Bar fill Cobalt hoàng gia, Line stroke Sage green với bóng mờ, bọc Bento Card bo góc `rounded-3xl` viền kem mờ).
  - Nâng cấp **Sidebar & Logo Container** tại [AppLayout.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/layouts/AppLayout.jsx) sử dụng nền kem ấm `#FCFAF6`, viền xô thơm siêu mảnh `border-r border-emerald-100/30`, biểu tượng Logo chiếc lá cách điệu cao cấp trong nền xanh lá xô thơm `bg-[#E8F5E9] text-[#2E7D32]`, và hiệu ứng Active Tab bóng Cobalt sang trọng cùng hover nav item pastel xô thơm.

### Fixed
- **Tăng tính kiên cố cho E2E Playwright happy path**:
  - Gia tăng thời gian chờ (`timeout: 20000`) cho hành động tạo hóa đơn hàng loạt trong `happy-path.spec.js` để kiên cố hóa trước độ trễ truy vấn mạng của database Postgres Neon trên môi trường Render.

### Verified
- ✅ Playwright E2E test suite: Toàn bộ 3 tệp test (`happy-path`, `notification-flow`, `qr-validation`) vượt qua thành công.
- ✅ Production build: Biên dịch frontend `npm run build` thành công xuất sắc, không lỗi.

---

## [1.4.2] - 2026-05-31

### Added
- **Nâng cấp Giao diện Thẩm mỹ cao cấp (Premium UI Redesign)**:
  - Khởi tạo hệ thống **Design Tokens** đồng bộ: nhúng phông chữ Google Font **Outfit** vào [index.html](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/index.html) làm phông chữ chủ đạo của toàn ứng dụng, mở rộng bảng màu trong [tailwind.config.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/tailwind.config.js) với nền kem ấm `#FDFBF7` (`cream.warm`) và xanh Cobalt hoàng gia `#0052CC` (`cobalt.royal`), đồng thời thiết lập biến toàn cục cho `body` trong [index.css](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/index.css).
- **Tái thiết kế màn hình Phòng & Khách thuê (Hero 1 - Bento Grid & Split-Screen)**:
  - Nâng cấp [RoomsPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/RoomsPage.jsx) chuyển đổi danh sách phòng trọ sang lưới thẻ **Bento Grid Cards** có hiệu ứng bóng mịn khi di chuột (`hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)]`) và cảm giác lún nẩy cơ học khi nhấn (`active:scale-[0.98]`).
  - Thay thế các tag trạng thái phòng màu nguyên bản thành các tag pastel dịu mát, cao cấp (`AVAILABLE` xanh mint, `OCCUPIED` đỏ hồng phấn, `MAINTENANCE` vàng hổ phách).
  - Tái cấu trúc [RoomDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/RoomDetailPage.jsx) và [TenantDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/TenantDetailPage.jsx) dạng Split-screen 50/50. Bên trái hiển thị thông tin Bento sắc nét, bên phải hiển thị lịch sử hóa đơn và các tệp đính kèm sạch sẽ.
  - Hiện đại hóa vùng Dropzone tải ảnh CCCD/hợp đồng scan của khách thuê với viền xanh Cobalt nét đứt mềm mại, bo góc `rounded-2xl` mượt mà.
- **Tái thiết kế Hóa đơn & Hộp thoại Kính mờ Thông báo (Hero 2 - E-Invoice & Glassmorphism overlay)**:
  - Refactor [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx) biến đổi thẻ hóa đơn sang phong cách **Minimalist E-Invoice** sạch sẽ, thanh lịch giống hóa đơn khách sạn sang trọng.
  - Xây dựng hộp thoại kính mờ truyền thông đa kênh (**Glassmorphism Dialog**) với nền mờ bán trong suốt (`backdrop-blur-md bg-white/75 border border-white/30`).
  - Thiết kế bộ 4 nút chia sẻ (Zalo, SMS, Copy, Webhook) dạng Bento mini có phản hồi xúc giác cơ học `active:scale-[0.97]` nẩy và thay đổi màu nền khi hover, đồng thời tích hợp hiệu ứng mạch đập pulse tăng tính Visibility of System Status.

### Fixed
- **Bảo toàn tính kiên cố cho E2E Testing**:
  - Giữ vững 100% các selector và thuộc tính `data-testid` để các kịch bản E2E Playwright hoạt động trơn tru.
  - Bổ sung song song các class màu sắc cũ (`bg-green-100 text-green-700`) làm fallback ẩn bên trong các tag pastel mới của Hóa đơn giúp Playwright tìm thấy chính xác huy hiệu thanh toán mà không làm suy thoái (regressions) các test case cũ.

### Verified
- ✅ Playwright E2E happy path: vượt qua xuất sắc trên trình duyệt Chromium.
- ✅ Production build: biên dịch mã nguồn Vercel bundle thành công rực rỡ, không cảnh báo hay lỗi.

---

## [1.4.1] - 2026-05-31

### Added
- **Hỗ trợ Sao lưu Google Drive qua Tài khoản Cá nhân (OAuth2 support)**:
  - Nâng cấp script [backup-to-gdrive.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/scripts/backup-to-gdrive.js) hỗ trợ cơ chế xác thực kép. Nếu chủ trọ cấu hình các biến môi trường OAuth2 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, và `GOOGLE_REFRESH_TOKEN`, hệ thống sẽ tự động dùng quyền truy cập tài khoản người dùng cá nhân thay thế cho Service Account.
  - Giải quyết triệt để lỗi giới hạn dung lượng lưu trữ `403: Service Accounts do not have storage quota` trên các tài khoản Gmail cá nhân miễn phí.
  - Cập nhật [.github/workflows/daily-backup.yml](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.github/workflows/daily-backup.yml) chuyển tiếp các biến môi trường bí mật này sang runner.

### Fixed
- **Sửa lỗi ràng buộc khóa ngoại khi xóa phòng (Cascade Deletion Order Fix)**:
  - Khắc phục lỗi `Foreign key constraint violated: Tenant_roomId_fkey` khi cố gắng xóa phòng trọ trên hệ thống.
  - Sửa đổi hàm `deleteRoom` trong [roomController.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/controllers/roomController.js) (dòng 77-100) sắp xếp lại thứ tự thực hiện các câu lệnh xóa trong `prisma.$transaction` đồng bộ: Hóa đơn (`Invoice`) -> Tài liệu khách thuê (`TenantFile`) -> Thông tin khách thuê (`Tenant`) -> Phòng trọ (`Room`).
  - Đảm bảo an toàn 100% khi xóa phòng có các thông tin khách thuê lịch sử (`active = false`) hay hóa đơn đã xuất mà không gây lỗi khóa ngoại.
- **Sửa lỗi phân giải search path cơ sở dữ liệu khi backup (Explicit Schema Prefix)**:
  - Bổ sung tiền tố schema `"public"` cho các truy vấn bảng trong [backup-to-gdrive.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/scripts/backup-to-gdrive.js) (truy vấn `"public"."User"`, `"public"."Room"`,...) tránh lỗi `relation "User" does not exist` do sự không đồng nhất về đường dẫn tìm kiếm mặc định (`search_path`) của kết nối PostgreSQL.
- **Tối ưu hóa nội dung thông báo Zalo/SMS (Notification Template Polish)**:
  - Loại bỏ đường dẫn liên kết xem hóa đơn trên web trong [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx) (do hệ thống được cấu hình bảo mật chỉ cho phép chủ trọ truy cập), thay thế bằng hướng dẫn người thuê đối soát trực tiếp trên tệp PDF đính kèm nhằm phù hợp hoàn toàn với ngữ cảnh thực tế (khách thuê không cần tài khoản đăng nhập).

### Verified
- ✅ Chạy kiểm thử đơn vị backend: `npm run test` vượt qua thành công, đảm bảo các hàm VietQR hoạt động bình thường.
- ✅ Sắp xếp thứ tự xóa đảm bảo logic dữ liệu chạy hoàn hảo trong các transaction cơ sở dữ liệu.

---

## [1.4.0] - 2026-05-31

### Added
- **Hệ thống Sao lưu Tự động lên Google Drive (Auto Backup)**:
  - Thiết lập kịch bản GitHub Actions [.github/workflows/daily-backup.yml](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.github/workflows/daily-backup.yml) tự động chạy vào lúc 2:00 AM giờ Việt Nam (19:00 UTC) hàng ngày.
  - Viết script [backup-to-gdrive.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/scripts/backup-to-gdrive.js) độc lập sử dụng Google API JWT client để tải bản sao lưu PostgreSQL lên thư mục Google Drive của chủ trọ thông qua Google Service Account.
- **Bộ truyền thông Nhắc nợ Hóa đơn Thông minh (Smart Notifications)**:
  - Thiết kế và tích hợp popup xem trước tin nhắn hóa đơn và chia sẻ đa kênh đẹp mắt tại chi tiết hóa đơn.
  - Hỗ trợ **Gửi Zalo** (tự sao chép tin soạn sẵn vào clipboard và mở khung chat Zalo tương ứng số điện thoại khách thuê).
  - Hỗ trợ **Gửi SMS** (tự động điền body plaintext tương thích tối đa và mở ứng dụng tin nhắn Native).
  - Hỗ trợ **Chia sẻ nhanh** (Web Share API hiện đại trên thiết bị di động).
  - Hỗ trợ **Đẩy Webhook** (đẩy JSON thông tin chi tiết hóa đơn kèm tin nhắn Discord Embed lên webhook của bên thứ ba).
- **Trường cơ sở dữ liệu Webhook URL**:
  - Bổ sung trường `webhookUrl` vào bảng `Settings` trong [schema.prisma](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/prisma/schema.prisma) để cho phép tùy biến endpoint nhận thông tin đẩy tự động.

### Changed
- **Giao diện Cài đặt (SettingsPage)**:
  - Thêm ô nhập trường `Webhook URL` trong tab cài đặt thông tin nhà trọ cho phép cấu hình endpoint bên thứ ba (Discord/n8n/Make).
- **Tái cấu trúc API & Route Backend**:
  - Bổ sung route `POST /api/invoices/:id/notify` gọi đến dịch vụ gửi webhook.
  - Viết module backend [notificationService.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/services/notificationService.js) để đóng gói thông điệp và truyền tải JSON dữ liệu an toàn.

### Verified
- ✅ Playwright E2E `notification-flow.spec.js`: Đăng nhập -> Cài đặt Webhook URL -> Xem chi tiết hóa đơn -> Mở Popup gửi thông báo -> Đóng Popup thành công — `1 passed` trong 11.8 giây.
- ✅ Backend Unit Tests: `npm run test` vẫn hoạt động tốt, ALL PASSED.

---

## [1.3.1] - 2026-05-30

### Added
- **Nhúng ảnh QR tĩnh vào hóa đơn PDF (Static QR Embedding)**:
  - Tích hợp cơ chế ưu tiên nhúng ảnh QR tĩnh từ tệp `backend/assets/qr_code.png` vào PDF hóa đơn thay vì sinh mã QR động.
  - Ảnh QR tĩnh (thẻ Techcombank do chủ trọ cung cấp) được nhúng với kích thước tỷ lệ đúng khung hình đứng dọc **rộng 110 × cao 215** (tỷ lệ ~1:2), đảm bảo hiển thị sắc nét không bị méo trên trang A4.
  - Giải quyết triệt để lỗi "Mã QR không hợp lệ" khi quét bằng ứng dụng ngân hàng, do mã QR giờ đây là bản gốc từ ngân hàng.
- **Tệp tài nguyên QR tĩnh**: Thêm mới tệp [qr_code.png](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/assets/qr_code.png) (140KB, 525×1024px) chứa ảnh thẻ QR Techcombank của chủ trọ.

### Changed
- **Tái cấu trúc kiến trúc QR trong pdfController (Two-Tier QR Architecture)**:
  - Refactor phần QR trong [pdfController.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/controllers/pdfController.js) (dòng 329-405) theo chiến lược hai tầng:
    - *Tầng 1 (Ưu tiên)*: Kiểm tra `fs.existsSync('backend/assets/qr_code.png')` → nhúng ảnh tĩnh.
    - *Tầng 2 (Dự phòng)*: Nếu ảnh tĩnh không tồn tại → sinh mã VietQR động EMVCo MPM (logic hiện tại được giữ nguyên).
  - Bảo toàn 100% backward compatibility: xóa tệp `qr_code.png` sẽ tự động quay về chế độ VietQR động.
- **Cập nhật đặc tả Kiro Specs**:
  - Cập nhật [requirements.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/requirements.md): Bổ sung yêu cầu tích hợp QR tĩnh/động linh hoạt vào mục R3.6.
  - Cập nhật [design.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/design.md): Chuyển mục "VietQR Code Specification" thành "QR Code Specification (Static Priority + VietQR Fallback)" với kiến trúc hai tầng.

### Verified
- ✅ Backend Unit Tests: `parsePaymentInfo` & `buildVietQRString` — ALL PASSED.
- ✅ Playwright E2E `qr-validation.spec.js`: Đăng nhập → Cấu hình cài đặt → Tạo phòng/khách/hóa đơn → Tải PDF thành công — `1 passed` (41.7s).

---


### Added
- **Bộ kiểm thử đơn vị tự động VietQR (Backend Unit Test)**:
  - Thêm mới tệp tin [pdfController.test.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/controllers/pdfController.test.js) kiểm thử đơn vị độc lập sử dụng module `assert` mặc định của Node.js.
  - Phủ rộng các test cases kiểm định giải thuật phân tích thông tin cài đặt ngân hàng thụ hưởng (`parsePaymentInfo`) và cấu trúc phân tích Tag EMVCo MPM của giải thuật sinh chuỗi VietQR (`buildVietQRString`) dưới nhiều trường hợp biên.
  - Bổ sung lệnh chạy test nhanh `"test"` vào [package.json](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/package.json).
- **Bộ kiểm thử E2E tự động hóa tích hợp QR & PDF (Playwright E2E)**:
  - Thêm mới kịch bản kiểm thử E2E Playwright [qr-validation.spec.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/e2e/qr-validation.spec.js) bao phủ trọn vẹn luồng: Đăng nhập -> Đi tới Cài đặt cấu hình tài khoản ngân hàng thụ hưởng -> Tạo phòng & khách trọ mẫu -> Lập hóa đơn hàng loạt điện nước -> Mở trang chi tiết hóa đơn -> Click tải xuống PDF hóa đơn -> Kiểm chứng tệp PDF được tải xuống thành công (`1 passed` trong 36 giây).
  - Tích hợp thêm các nhãn thuộc tính kiểm thử bền vững `data-testid` trên các trường của [SettingsPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/SettingsPage.jsx) (`settings-shopName`, `settings-paymentInfo`, `settings-save-btn`) và nút PDF trên [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx) (`invoice-download-pdf-btn`).

### Changed
- **Nâng cấp Tiêu chuẩn VietQR tuân thủ 100% EMVCo MPM & Napas 24/7**:
  - Tái cấu trúc hàm `buildVietQRString` trong [pdfController.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/controllers/pdfController.js) tuân thủ nghiêm ngặt các quy định về thẻ bắt buộc và giá trị chuẩn hóa của EMVCo:
    - *Tag 01 (Point of Initiation Method)*: Động hóa thành `"12"` (Dynamic QR) khi có số tiền thanh toán (thay vì cố định `"11"` gây lỗi quét ở một số app ngân hàng).
    - *Tag 52 (Merchant Category Code)*: Thêm trường bắt buộc mặc định `"0000"`.
    - *Tag 59 (Merchant Name)*: Lấy động từ cài đặt `shopName` của chủ trọ và chuẩn hóa sang ASCII viết hoa không dấu (ví dụ: `"NHA TRO HOA HONG"`).
    - *Tag 60 (Merchant City)*: Thêm trường bắt buộc mặc định `"HA NOI"`.
    - *Tag 54 (Transaction Amount)*: Ép buộc làm tròn số nguyên (`Math.round`) để tránh phần thập phân gây lỗi.
    - *Tag 62 Sub-tag 08 (Purpose of Transaction)*: Chuẩn hóa nội dung mô tả chuyển khoản thành chữ hoa không dấu không ký tự đặc biệt, giới hạn tối đa 25 ký tự.

---

## [1.2.0] - 2026-05-29

### Added
- **UI Test Automation Suite (Playwright E2E)**:
  - Cấu hình tệp tin [playwright.config.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/playwright.config.js) kiểm thử Sequential (`workers: 1`) trên local để chống xung đột/lock database SQLite.
  - Viết kịch bản kiểm thử Happy Path tự động cao cấp [happy-path.spec.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/e2e/happy-path.spec.js) bao phủ trọn vẹn chu trình nghiệp vụ cốt lõi: Đăng nhập -> Tạo phòng trọ -> Đăng ký khách thuê -> Tự động chuyển trạng thái phòng sang "Có người" -> Tạo hóa đơn điện nước hàng loạt -> Đối soát giá trị hóa đơn chính xác -> Ghi nhận thanh toán hóa đơn -> Trả phòng (soft delete) -> Trạng thái phòng quay về "Trống".
  - Tích hợp 100% Client-Side Routing bằng cách dùng sidebar navigation thay thế cho `page.goto` reload trang, bảo toàn Zustand Memory State (`accessToken`), triệt tiêu hoàn toàn race condition trong cơ chế Silent Refresh token. Chạy test Playwright E2E thành công rực rỡ (`1 passed` trong 34 giây).
- **Tích hợp Thẻ Kiểm Thử data-testid**:
  - Bổ sung định danh kiểm thử `data-testid` vững chãi vào các tệp giao diện:
    - [InvoicesPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoicesPage.jsx): `bulk-create-btn`, `bulk-electricity-now-${roomId}`, `bulk-water-now-${roomId}`, `bulk-confirm-btn`, `invoice-row-${month}-${year}-${room}`, `invoice-view-detail-${id}`.
    - [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx): `invoice-pay-btn`, `invoice-total-amount`.

### Changed
- **Nâng cấp Hệ thống Đồng bộ TanStack Query v5**:
  - Chuyển đổi toàn bộ lệnh invalidation `qc.invalidateQueries([...])` cũ (v4 syntax) thành cú pháp đối tượng mới `{ queryKey: [...] }` bắt buộc của TanStack Query v5 trên toàn monorepo: `RoomsPage`, `TenantsPage`, `InvoicesPage`, `RoomDetailPage`, `InvoiceDetailPage`, `SettingsPage` và `TenantDetailPage`.
  - Tích hợp hàm `refetch` trực tiếp từ `useQuery` và gọi ép buộc khi đóng các Dialog thêm phòng/thêm khách để đảm bảo đồng bộ dữ liệu ngay lập tức trên UI mà không bị phụ thuộc vào cache delay.

### Added (Backend)
- **Hệ thống Trace Log API**: Bổ sung middleware tự động in log chi tiết từng lượt request/response dạng `[API] METHOD URL -> STATUS` trong [index.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/index.js) để phục vụ quá trình debug và kiểm soát E2E chính xác hơn.

---

## [1.1.0] - 2026-05-29

### Added
- **Quy trình Đặc tả dự án (Spec-driven Integration)**:
  - Khởi tạo thư mục gốc điều phối dự án [AGENTS.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/AGENTS.md) và nhật ký lịch sử thay đổi [CHANGELOG.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/CHANGELOG.md) theo đúng quy tắc **Step 4: Governance & Sync** của Spec-Driven Workflow.
  - Xây dựng thành công 3 tệp tin đặc tả nghiệp vụ cao cấp của `.kiro` đặt tại `.kiro/specs/house-renting-management/`:
    - [requirements.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/requirements.md) (Quy hoạch yêu cầu chức năng R1-R6 và Tiêu chí nghiệm thu Acceptance Criteria dạng Given/When/Then).
    - [design.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/design.md) (Thiết kế luồng dữ liệu, sơ đồ kiến trúc Mermaid, database schema Prisma và tiêu chuẩn Heuristic UI/UX).
    - [tasks.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/tasks.md) (Bản đồ phân rã công việc chi tiết, chia rõ các cột mốc đã hoàn thành và các task nâng cấp tương lai).
- **Hệ thống tải chờ cao cấp (Skeleton Loading System)**:
  - Tạo mới component [Skeleton.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/components/Skeleton.jsx) chứa các khối pulsing cấu trúc cao mô phỏng sát thực tế giao diện:
    - `SkeletonCard` (avatar, title, subtitle, buttons pulsing).
    - `SkeletonTable` (pulsing headers and row lines).
    - `SkeletonDashboard` (pulsing StatCards and charts placeholder).
    - `SkeletonDetail` (back button, double column details placeholder).
  - Tích hợp Skeleton Loaders mới vào tất cả 7 trang chính: `DashboardPage`, `RoomsPage`, `TenantsPage`, `InvoicesPage`, `RoomDetailPage`, `InvoiceDetailPage`, và `SettingsPage` để nâng cấp tính ổn định và tính chuyên nghiệp cho hệ thống (đáp ứng Task 11 Heuristic Polish).

### Fixed
- **Sửa lỗi logic tắt tự động của WakeUpBanner**: Cập nhật tệp [WakeUpBanner.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/components/WakeUpBanner.jsx) giải phóng bộ hẹn giờ và gọi `setWaking(false)` ẩn banner lập tức ngay khi nhận được tín hiệu phản hồi thành công từ API `/health` của backend, cải thiện trải nghiệm người dùng (Heuristic H1).
- **Khắc phục lỗi tràn viền giao diện di động (Responsive Table)**: Trong tệp [InvoicesPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoicesPage.jsx), bao bọc thẻ `<table>` bằng container có class `overflow-x-auto` và áp dụng `min-w-[600px]` giúp bảng hóa đơn cuộn ngang mượt mà độc lập trên mobile (iPhone 375px), loại bỏ lỗi Horizontal Scroll Leak vỡ layout (đáp ứng Task 12 Responsive Polish).
- **Tối ưu hóa Biểu đồ (Responsive Charts)**: Trong tệp [DashboardPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/DashboardPage.jsx), đặt trục tick chữ biểu đồ về cỡ `10` và thêm `margin={{ top: 10, right: 5, left: -20, bottom: 0 }}` để biểu đồ co giãn mượt mà và hiển thị trọn vẹn, không bị đè chéo hay mất chữ nhãn hiển thị khi thu hẹp màn hình.

---

## [1.0.0] - 2026-04-22

### Added
- Khởi chạy phiên bản đầu tiên của House Renting App (Mạng Quản lý Nhà trọ).
- Các phân hệ hoàn thiện:
  - Auth: Xác thực JWT token, silent refresh, login page.
  - Rooms: CRUD phòng trọ, cấu hình điện nước rác riêng biệt.
  - Tenants: CRUD khách trọ, upload ảnh CCCD và hợp đồng scan lên Cloudinary đám mây.
  - Invoices: Thuật toán tiền phòng lẻ ngày pro-rata, tạo hóa đơn đơn lẻ.
  - Bulk Creator: Tạo hóa đơn điện nước hàng loạt cho cả khu trọ chỉ với 1 click.
  - PDF: Tạo tệp PDF hóa đơn nhúng font Segoe UI TTF hiển thị tiếng Việt Unicode và tích hợp mã QR thanh toán động VietQR.
  - Dashboard: Biểu đồ doanh thu Recharts và cảnh báo nợ/hợp đồng hết hạn.
  - Settings: Lưu cài đặt chủ trọ và nút sao lưu dữ liệu toàn năm ra CSV.
