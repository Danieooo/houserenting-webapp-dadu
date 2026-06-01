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
*   **Tài liệu hỗ trợ và Deploy**:
    *   [deployment-steps.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/docs/deployment-steps.md) — Hướng dẫn chi tiết các bước triển khai backend/frontend lên môi trường sản phẩm đám mây.
    *   [README.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/README.md) — Trang hướng dẫn bắt đầu nhanh và giới thiệu giao diện Botanic Floria UI cao cấp của sản phẩm.

---

## 3. Quy tắc làm việc cốt lõi (Governance & System Rules)

Để tránh hiện tượng viết code tự phát không kiểm soát ("cowboy coding"), dự án bắt buộc phải tuân thủ chu trình phát triển **Spec-Driven Development Workflow** gồm 4 bước kết hợp bộ kỹ năng **Superpowers Plugin**:

1.  **Bước 1: Quy hoạch Đặc tả (Specification Phase)**: Khi có tính năng mới hoặc yêu cầu sửa đổi, áp dụng kỹ năng **`brainstorming`** để phân tích, tự hỏi và thảo luận kiến trúc sâu sắc, cập nhật các tệp đặc tả trong `.kiro/specs/...` hoặc `docs/superpowers/specs/...`. Chỉ khi thiết kế và đặc tả được phê duyệt thông qua **`writing-plans`** (Kế hoạch bite-size cấm placeholder "TBD", có code mẫu, test case rõ ràng) thì mới chuyển sang viết code.
2.  **Bước 2: Hiện thực hóa theo Task (Modular Coding)**: Thực thi tuần tự theo kỹ năng **`executing-plans`** (inline execution trực tiếp trên `main`, không worktrees). Tạo tệp `task.md` để tự kiểm soát. Lập trình đúng cấu trúc, bám sát các mốc nhiệm vụ.
3.  **Bước 3: Kiểm thử & Xác thực Trực quan (Verification)**: Áp dụng **`test-driven-development`** (E2E-first cho UI, RED-GREEN-REFACTOR cho logic backend) và kỹ năng **`verification-before-completion`** (Cổng xác minh nghiêm ngặt: chạy test, đọc và phân tích output, xác nhận exit code thành công TRƯỚC KHI tuyên bố). Nếu gặp lỗi, áp dụng **`systematic-debugging`** 4 pha có hệ thống, không sửa đổi mù quáng.
4.  **Bước 4: Đồng bộ Tài liệu Gốc & Changelog (Governance & Sync)**: Trước khi bàn giao công việc, AI bắt buộc phải cập nhật trạng thái mới nhất vào hai file trụ cột: `AGENTS.md` (tài liệu này) và `CHANGELOG.md`.

---

## 4. Hard Project Rules (Quy tắc thép bắt buộc)

1.  **`AGENTS.md`** là bộ não trung tâm của dự án và luôn phải phản ánh chính xác trạng thái thực thi của sản phẩm.
2.  **`CHANGELOG.md`** là lịch sử thay đổi chuẩn chỉnh và phải ghi nhận mọi chỉnh sửa về mã nguồn, cấu hình hay đặc tả spec.
3.  Bất kỳ thay đổi nào tác động đến yêu cầu nghiệp vụ, cấu trúc component, phạm vi công việc hay quy tắc hệ thống **BẮT BUỘC** phải cập nhật đồng thời cả [AGENTS.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/AGENTS.md) và [CHANGELOG.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/CHANGELOG.md) trong cùng một lượt bàn giao công việc trước khi xem là hoàn thành.
4.  Không sử dụng tệp `README.md` ở gốc làm file governance. Mọi quy tắc và quản lý dự án đều thuộc về `AGENTS.md`.

---

## 5. System Status & Milestone Progress (Trạng thái hệ thống & Tiến độ)

*   **Phiên bản hiện tại**: `1.4.5` (Patch 1.4.5: Tài liệu Hóa & Tối giản Monorepo)
*   **Trạng thái vận hành**: Hệ thống đã dọn dẹp sạch sẽ 7 tệp tài liệu Markdown lỗi thời, hoàn tất viết lại tài liệu `README.md` chuẩn Botanic Floria UI và đã chạy kiểm thử backend unit test thành công.
*   **Chi tiết lịch sử nâng cấp**: Toàn bộ nhật ký phát triển chi tiết của các phiên bản trước (từ `1.0.0` đến `1.4.4`) đã được lưu trữ và quản lý thống nhất tại tệp tin **[CHANGELOG.md](file:///c:/Users/Duyen/Documents/GitHub/houserenting-app/CHANGELOG.md)**.
