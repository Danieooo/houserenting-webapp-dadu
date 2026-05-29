# Changelog

All notable changes to the **House Renting App** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
