# Hướng dẫn: Khởi động dự án mới với GitHub Copilot (Superpowers)

> Quy trình này đã được dùng để xây dựng House Renting App từ ý tưởng → sản phẩm chạy được trong ~1 ngày.

---

## Các file tài liệu cần có

Mỗi dự án cần 2 file trong thư mục `docs/superpowers/`:

| File | Vai trò |
|------|---------|
| `specs/YYYY-MM-DD-<tên-dự-án>-design.md` | **Spec** — Mô tả sản phẩm: chức năng, tech stack, data model, UI/UX |
| `plans/YYYY-MM-DD-<tên-dự-án>-implementation.md` | **Plan** — Kế hoạch thực thi: từng Task có checkbox, ghi chú trạng thái |

---

## Quy trình 3 bước

### Bước 1 — Brainstorm (tạo Spec)

Chat với Copilot, mô tả ý tưởng dự án bằng tiếng Việt bình thường:

```
Tôi muốn xây dựng [mô tả ý tưởng].
Hãy brainstorm và tạo design spec tại docs/superpowers/specs/YYYY-MM-DD-<tên>-design.md
```

Spec cần có:
- Mục tiêu / đối tượng người dùng
- Tech stack (chọn free tier nếu có thể: Neon, Render, Vercel, Cloudinary)
- Architecture diagram (text hoặc ASCII)
- Data model (Prisma schema)
- Danh sách tính năng từng module
- UI/UX mockup (mô tả bằng text)

**Tham khảo:** `docs/superpowers/specs/2026-04-21-houserenting-app-design.md`

---

### Bước 2 — Viết Plan (tạo Implementation Plan)

Sau khi có Spec, yêu cầu Copilot tạo plan:

```
Dựa vào SPEC tại docs/superpowers/specs/..., hãy viết implementation plan
tại docs/superpowers/plans/YYYY-MM-DD-<tên>-implementation.md
```

Plan cần có:
- Bảng trạng thái các Task (dùng checkbox `- [ ]`)
- Mỗi Task chia thành các bước nhỏ có thể thực thi độc lập
- Ghi rõ dependencies giữa các Task
- Section "Trạng thái thực thi" để cập nhật tiến độ

**Tham khảo:** `docs/superpowers/plans/2026-04-21-houserenting-app-implementation.md`

---

### Bước 3 — Thực thi từng Task

Yêu cầu Copilot implement từng task:

```
SPEC: docs/superpowers/specs/...
PLAN: docs/superpowers/plans/...

Hãy implement Task [N] — [tên task].
Cập nhật trạng thái trong PLAN sau khi hoàn thành.
```

---

## Cấu trúc thư mục cho dự án mới

```
my-new-app/
├── docs/
│   └── superpowers/
│       ├── specs/
│       │   └── YYYY-MM-DD-my-new-app-design.md       ← Tạo ở Bước 1
│       └── plans/
│           └── YYYY-MM-DD-my-new-app-implementation.md ← Tạo ở Bước 2
├── frontend/   ← Vite+React (hoặc framework khác)
├── backend/    ← Node+Express (hoặc framework khác)
└── start.cmd   ← Script khởi động local (tùy chọn)
```

---

## Free-tier stack gợi ý

| Loại | Dịch vụ | Giới hạn free |
|------|---------|--------------|
| Frontend host | Vercel | Unlimited projects |
| Backend host | Render | 750h/tháng (1 service) |
| Database | Neon PostgreSQL | 0.5 GB |
| File storage | Cloudinary | 25 GB |
| Cron jobs | cron-job.org | Unlimited |

---

## Lưu ý quan trọng

- **SQLite cho dev local**, PostgreSQL (Neon) cho production — đổi trong `schema.prisma` trước khi deploy
- Mạng **Bosch block** Neon + GitHub → cần hotspot/WiFi cá nhân để deploy
- Font tiếng Việt trong PDF: bundle TTF vào `backend/assets/fonts/` (dùng Segoe UI hoặc font tương tự)
- Render free tier ngủ sau 15 phút → dùng `WakeUpBanner` component (`frontend/src/components/WakeUpBanner.jsx`) để thông báo người dùng khi deploy
