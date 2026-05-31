# House Renting App Project Agent (Governance & Governance System)

Tài liệu này là nguồn tài liệu gốc (Source-of-truth) điều phối toàn bộ dự án **House Renting App**. Tài liệu ghi nhận mục tiêu dự án, cấu trúc tài nguyên hiện tại, quy tắc làm việc hướng đặc tả (Spec-Driven), các ràng buộc kiểm thử và nhật ký cập nhật hệ thống.

---

## 1. Project Summary (Tổng quan dự án)

*   **Mục tiêu**: Xây dựng ứng dụng web quản lý nhà trọ tối ưu dành cho chủ nhà trọ quy mô vừa và nhỏ (5–20 phòng) chạy hoàn toàn miễn phí trên Cloud.
*   **Chức năng cốt lõi**:
    *   Tính tiền hàng tháng tự động (điện, nước, vệ sinh) bám sát chỉ số cũ/mới thực tế.
    *   Quản lý thông tin và trạng thái phòng (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).
    *   Lưu trữ hồ sơ khách thuê, đặt cọc và hợp đồng scan upload trực tiếp đám mây (Cloudinary).
    *   Thuật toán Pro-rata phân bổ tiền phòng lẻ ngày khi đổi khách trọ giữa tháng.
    *   Tạo hóa đơn hàng loạt bằng 1 click và xuất bản PDF hóa đơn chuyên nghiệp kèm QR Code chuyển khoản VietQR tự động.
    *   Dashboard báo cáo doanh thu và công suất phòng bằng biểu đồ trực quan (Recharts).
*   **Kiến trúc Tech Stack**:
    *   **Frontend**: Vite + React 18 + Tailwind CSS (Component-based).
    *   **State Management**: Zustand (Client state/Auth) & TanStack Query v5 (Server state).
    *   **Backend**: Node.js + Express.js.
    *   **ORM**: Prisma ORM.
    *   **Database**: PostgreSQL (Neon Serverless).
    *   **File Storage**: Cloudinary.
    *   **Utilities**: pdf-lib (Tạo hóa đơn PDF).

---

## 2. Current Scope & Deliverables (Phạm vi & Sơ đồ tài liệu)

Dự án hiện tại được quản lý nghiêm ngặt bởi bộ tài liệu Đặc tả Kiro tại `.kiro/` và các tài liệu triển khai liên quan:

### Sơ đồ tài nguyên kỹ thuật (Artifact Map)
*   **Quy hoạch Đặc tả Kiro (Specs)**:
    *   [requirements.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/requirements.md) — Yêu cầu nghiệp vụ và Acceptance Criteria của sản phẩm.
    *   [design.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/design.md) — Thiết kế kiến trúc kỹ thuật, ranh giới quản lý trạng thái, database schema và heuristic checklist.
    *   [tasks.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.kiro/specs/house-renting-management/tasks.md) — Danh sách kiểm soát tiến độ thực thi các task lập trình hiện tại và tương lai.
*   **Mã nguồn Codebase**:
    *   [frontend/](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend) — Dự án Vite + React.
    *   [backend/](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend) — Dự án Express + Prisma.
*   **Tài liệu hỗ trợ cũ**:
    *   `docs/superpowers/specs/...` & `docs/superpowers/plans/...` (Lưu giữ thông tin thiết kế và kế hoạch ban đầu trước khi chuyển dịch sang bộ kit Spec-driven mới).

---

## 3. Quy tắc làm việc cốt lõi (Governance & System Rules)

Để tránh hiện tượng viết code tự phát không kiểm soát ("cowboy coding"), dự án bắt buộc phải tuân thủ chu trình phát triển **Spec-Driven Development Workflow** gồm 4 bước:

1.  **Bước 1: Quy hoạch Đặc tả (Specification Phase)**: Khi có tính năng mới hoặc yêu cầu sửa đổi, AI bắt buộc phải phân tích và cập nhật các tệp `requirements.md` và `design.md` trong `.kiro/specs/...` trước tiên. Chỉ khi spec được người dùng phê duyệt thông qua *Implementation Plan* thì mới được chuyển sang viết code.
2.  **Bước 2: Hiện thực hóa theo Task (Modular Coding)**: Tạo tệp `task.md` lâm thời trong thư mục `.system_generated` để theo dõi. Lập trình mượt mà, đúng cấu trúc, bám sát các mốc nhiệm vụ đã vạch ra.
3.  **Bước 3: Kiểm thử & Xác thực Trực quan (Verification)**: Viết các ca kiểm thử tự động (Playwright) và chạy xác thực đa thiết bị (Desktop, Mobile, Tablet).
4.  **Bước 4: Đồng bộ Tài liệu Gốc & Changelog (Governance & Sync)**: Trước khi bàn giao công việc, AI bắt buộc phải cập nhật trạng thái mới nhất vào hai file trụ cột: `AGENTS.md` (tài liệu này) và `CHANGELOG.md`.

---

## 4. Hard Project Rules (Quy tắc thép bắt buộc)

1.  **`AGENTS.md`** là bộ não trung tâm của dự án và luôn phải phản ánh chính xác trạng thái thực thi của sản phẩm.
2.  **`CHANGELOG.md`** là lịch sử thay đổi chuẩn chỉnh và phải ghi nhận mọi chỉnh sửa về mã nguồn, cấu hình hay đặc tả spec.
3.  Bất kỳ thay đổi nào tác động đến yêu cầu nghiệp vụ, cấu trúc component, phạm vi công việc hay quy tắc hệ thống **BẮT BUỘC** phải cập nhật đồng thời cả [AGENTS.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/AGENTS.md) và [CHANGELOG.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/CHANGELOG.md) trong cùng một lượt bàn giao công việc trước khi xem là hoàn thành.
4.  Không sử dụng tệp `README.md` ở gốc làm file governance. Mọi quy tắc và quản lý dự án đều thuộc về `AGENTS.md`.

---

## 5. System Status & Milestone Progress (Trạng thái hệ thống & Tiến độ)

Hiện tại hệ thống đã hoàn thành xuất sắc đợt cải tiến mới nhất (Phiên bản `1.4.1`):
*   **Patch 1.4.1: Cascade Deletion & OAuth2 Backup Fix**: 
    - Sửa lỗi logic thứ tự xóa trong `prisma.$transaction` của API `deleteRoom` tại [roomController.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/backend/src/controllers/roomController.js). Thay đổi thứ tự bắt buộc: Hóa đơn -> Tài liệu CCCD/Hợp đồng -> Khách thuê -> Phòng. Giải quyết triệt để lỗi ràng buộc khóa ngoại `Foreign key constraint violated: Tenant_roomId_fkey (index)` khi xóa phòng có liên kết với dữ liệu lịch sử.
    - Cải tiến tập lệnh [backup-to-gdrive.js](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/scripts/backup-to-gdrive.js) và kịch bản [.github/workflows/daily-backup.yml](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/.github/workflows/daily-backup.yml) hỗ trợ xác thực kép: Tự động phát hiện và sử dụng Google OAuth2 (Client ID, Client Secret, Refresh Token) để sử dụng dung lượng lưu trữ 15GB cá nhân miễn phí của chủ trọ, khắc phục triệt để lỗi `403: Service Accounts do not have storage quota` trên các tài khoản Google Drive cá nhân. Đồng thời, bổ sung tiền tố schema `"public"` vào các câu lệnh SQL để loại bỏ hoàn toàn lỗi phân giải đường dẫn tìm kiếm bảng (`relation "User" does not exist`) của PostgreSQL.
    - Tối ưu hóa nội dung tin nhắn Zalo/SMS trong [InvoiceDetailPage.jsx](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/frontend/src/pages/InvoiceDetailPage.jsx): Loại bỏ đường dẫn liên kết xem hóa đơn trên web (do hệ thống được cấu hình bảo mật chỉ cho phép chủ trọ truy cập), thay thế bằng hướng dẫn người thuê đối soát trực tiếp trên tệp PDF hóa đơn đính kèm để phù hợp hoàn toàn với ngữ cảnh thực tế (khách thuê không cần tài khoản đăng nhập).
*   **Task 15: Auto Backup & Smart Notifications**: Tích hợp kịch bản GitHub Actions tự động dump database Neon PostgreSQL và upload lên Google Drive hàng ngày lúc 2:00 AM ICT sử dụng Google API Service Account. Xây dựng popup truyền thông chia sẻ tin nhắn hóa đơn đa kênh đẹp mắt tại frontend cho phép Gửi Zalo (tự sao chép tin nhắn và mở chat), Gửi SMS (Native body), Chia sẻ nhanh (Web Share API) và Đẩy Webhook JSON (Discord embed compatible) sang các cổng tự động hóa. Đã xác thực E2E Playwright `notification-flow.spec.js` thành công rực rỡ (`1 passed` trong 11.8 giây).
*   **Task 11: Heuristic UI/UX Polish**: Đã bổ sung các màn hình chờ Skeleton co giãn mượt mà cho toàn bộ danh sách phòng, danh sách hóa đơn, khách thuê, chi tiết phòng và cài đặt. Cải tiến hiển thị lỗi chi tiết tiếng Việt và tự động đóng banner khi API thức giấc thành công.
*   **Task 12: Responsive Polish**: Sửa triệt để các lỗi tràn viền chiều ngang (`overflow-x`) trên di động cho bảng hóa đơn và dashboard. Tối ưu hóa Recharts ResponsiveContainer co giãn mượt mà trên Mobile (375px), Tablet (768px).
*   **Task 13: UI Automation Testing**: Tích hợp Playwright E2E. Cài đặt các thẻ `data-testid` định danh kiểm thử chuẩn xác trên tất cả các trang. Thiết lập kịch bản `happy-path.spec.js` chạy 100% bằng định tuyến client-side router, bảo toàn Zustand state (accessToken), loại bỏ hoàn toàn hiện tượng Silent Refresh race condition. Chạy test Playwright E2E thành công rực rỡ (`1 passed` trong 34 giây).
*   **Task 16: VietQR Standards & QR Testing**: Nâng cấp bộ sinh mã QR thanh toán động VietQR đạt chuẩn 100% EMVCo MPM & Napas 24/7 (hỗ trợ dynamic Tag 01, làm tròn số tiền Tag 54, bổ sung Tag 52, 59, 60, và chuẩn hóa nội dung mô tả chuyển khoản Tag 62). Viết unit test backend sử dụng module native `assert` bảo phủ các trường hợp biên. Xây dựng kịch bản kiểm thử E2E Playwright `qr-validation.spec.js` xác định thành công luồng cấu hình cài đặt và tải PDF hóa đơn chứa mã QR động VietQR thành công (`1 passed` trong 36 giây).
*   **Patch 1.3.1: Static QR Embedding**: Chuyển đổi kiến trúc QR trên hóa đơn PDF sang chiến lược hai tầng ưu tiên. Ưu tiên nhúng ảnh QR tĩnh (`backend/assets/qr_code.png`) do chủ trọ cung cấp trực tiếp từ ứng dụng ngân hàng Techcombank (525×1024px, tỷ lệ nhúng 110×215), giải quyết triệt để lỗi "Mã QR không hợp lệ" khi quét. Fallback tự động sang sinh mã VietQR động EMVCo khi ảnh tĩnh không tồn tại. Cập nhật đồng bộ specs (`requirements.md`, `design.md`). Xác thực E2E Playwright `qr-validation.spec.js` thành công (`1 passed` trong 41.7 giây).
