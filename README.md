# House Renting App

Ứng dụng quản lý nhà trọ dành cho chủ nhà nhỏ và khách thuê, bao gồm quản lý phòng, khách thuê, hóa đơn, dashboard thống kê, tạo PDF hóa đơn, và triển khai miễn phí với Vercel / Render / Neon.

## Tài liệu chính

- `docs/houserenting-app-final-summary.md` — Báo cáo tổng hợp chức năng, kiến trúc, công nghệ, môi trường.
- `docs/HOW-TO-START-A-NEW-PROJECT.md` — Hướng dẫn quy trình tạo dự án mới theo phong cách Superpowers.
- `docs/superpowers/specs/2026-04-21-houserenting-app-design.md` — Thiết kế spec của dự án.
- `docs/superpowers/plans/2026-04-21-houserenting-app-implementation.md` — Kế hoạch triển khai và trạng thái thực thi.

## Bắt đầu nhanh

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Chạy nhanh cả app

Chạy file `start-local.cmd` tại thư mục gốc để mở nhanh backend và frontend trong hai cửa sổ terminal riêng:

```cmd
start-local.cmd
```

## Cấu trúc dự án

- `backend/` — Node.js + Express, Prisma, API và business logic.
- `frontend/` — Vite + React + Tailwind, giao diện người dùng.
- `docs/` — Tài liệu dự án, spec, plan, báo cáo.

## Ghi chú

- `README.md` hiện đã được cập nhật để chỉ ra các tài liệu có sẵn.
- Nếu muốn tiếp tục, bạn có thể mở `docs/houserenting-app-final-summary.md` để xem tổng quan chức năng và cấu hình hiện tại.
