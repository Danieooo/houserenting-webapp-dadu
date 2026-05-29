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

Hiện tại hệ thống đã hoàn thành xuất sắc đợt cải tiến lớn (Phiên bản `1.2.0`):
*   **Task 11: Heuristic UI/UX Polish**: Đã bổ sung các màn hình chờ Skeleton co giãn mượt mà cho toàn bộ danh sách phòng, danh sách hóa đơn, khách thuê, chi tiết phòng và cài đặt. Cải tiến hiển thị lỗi chi tiết tiếng Việt và tự động đóng banner khi API thức giấc thành công.
*   **Task 12: Responsive Polish**: Sửa triệt để các lỗi tràn viền chiều ngang (`overflow-x`) trên di động cho bảng hóa đơn và dashboard. Tối ưu hóa Recharts ResponsiveContainer co giãn mượt mà trên Mobile (375px), Tablet (768px).
*   **Task 13: UI Automation Testing**: Tích hợp Playwright E2E. Cài đặt các thẻ `data-testid` định danh kiểm thử chuẩn xác trên tất cả các trang. Thiết lập kịch bản `happy-path.spec.js` chạy 100% bằng định tuyến client-side router, bảo toàn Zustand state (accessToken), loại bỏ hoàn toàn hiện tượng Silent Refresh race condition. Chạy test Playwright E2E thành công rực rỡ (`1 passed` trong 34 giây).

