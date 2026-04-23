# House Renting App — Design Spec

**Ngày:** 2026-04-21  
**Phiên bản:** 1.0  
**Tác giả:** GitHub Copilot (Brainstorming session)

---

## 1. Mục tiêu

Xây dựng web app quản lý nhà trọ dành cho chủ nhà nhỏ (5–20 phòng), chạy hoàn toàn miễn phí trên cloud. Các chức năng cốt lõi: tính tiền hàng tháng (điện/nước), quản lý khách thuê, dashboard tổng quan với biểu đồ doanh thu.

---

## 2. Tech Stack

| Layer | Công nghệ | Lý do chọn |
|---|---|---|
| Frontend | Vite + React 18 | Đã có scaffold, build nhanh |
| UI Components | shadcn/ui + TailwindCSS | Desktop-first, đẹp, accessible |
| Charts | Recharts | Lightweight, dễ tích hợp React |
| Form | react-hook-form + zod | Validation type-safe, ít re-render |
| Server state | TanStack Query (React Query) | Cache, refetch, loading/error tự động |
| Client state | Zustand | Quản lý auth token đơn giản |
| Backend | Node.js + Express | Đã có scaffold |
| ORM | Prisma | Type-safe, migrations tự động |
| Database | PostgreSQL (Neon serverless) | Free vĩnh viễn 0.5GB, không cần server |
| File storage | Cloudinary | Free 25GB, hỗ trợ ảnh + PDF |
| PDF | pdf-lib | Tạo PDF hóa đơn phía backend |
| Frontend host | Vercel | Free, CDN nhanh, auto-deploy |
| Backend host | Render | Free tier, auto-deploy từ GitHub |

**Ngôn ngữ giao diện:** Tiếng Việt (hardcode, không dùng i18n)

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                 │
│         Vite + React + TailwindCSS + shadcn/ui       │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS REST API (JSON)
┌──────────────────────▼──────────────────────────────┐
│                  RENDER (Backend)                    │
│           Node.js + Express + Prisma ORM             │
└──────────────────────┬──────────────────────────────┘
          ┌────────────┴─────────────┐
          │                          │
┌─────────▼──────────┐   ┌──────────▼──────────┐
│   NEON (Database)  │   │  CLOUDINARY (Files) │
│   PostgreSQL       │   │  CCCD, hợp đồng scan│
└────────────────────┘   └─────────────────────┘
```

**Monorepo structure:**
```
houserenting-app/
├── frontend/    → deploy Vercel
├── backend/     → deploy Render
└── docs/
```

---

## 4. Data Model (Prisma Schema)

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String    // bcrypt hash
  name      String
  createdAt DateTime  @default(now())
  rooms         Room[]
  invoices      Invoice[]
  refreshTokens RefreshToken[]
  settings      Settings?
}

model Room {
  id            Int        @id @default(autoincrement())
  name          String                   // "Phòng 101"
  floor         Int?
  area          Float?                   // m²
  baseRent      Int                      // VND/tháng
  electricPrice Int        @default(3500)  // VND/kWh
  waterPrice    Int        @default(15000) // VND/m³
  garbageFee    Int        @default(20000) // VND/tháng
  status        RoomStatus @default(AVAILABLE)
  userId        Int
  user          User       @relation(fields: [userId], references: [id])
  tenants       Tenant[]
  invoices      Invoice[]
  createdAt     DateTime   @default(now())
}

enum RoomStatus { AVAILABLE  OCCUPIED  MAINTENANCE }

model Tenant {
  id          Int          @id @default(autoincrement())
  name        String
  phone       String
  idCard      String?
  roomId      Int
  room        Room         @relation(fields: [roomId], references: [id])
  moveInDate  DateTime
  moveOutDate DateTime?
  deposit     Int          @default(0)
  active      Boolean      @default(true)
  files       TenantFile[]
  invoices    Invoice[]
  createdAt   DateTime     @default(now())
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

// Settings — thông tin nhà trọ (1 record / user, dùng cho PDF hóa đơn)
model Settings {
  id        Int      @id @default(autoincrement())
  userId    Int      @unique
  user      User     @relation(fields: [userId], references: [id])
  shopName  String   @default("Nhà trọ")
  address   String   @default("")
  phone     String   @default("")
  logoUrl   String?           // Cloudinary URL
  updatedAt DateTime @updatedAt
}

model TenantFile {
  id        Int      @id @default(autoincrement())
  tenantId  Int
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  label     String   // "CCCD mặt trước", "Hợp đồng tháng 1/2026"
  url       String   // Cloudinary URL
  createdAt DateTime @default(now())
}

model Invoice {
  id               Int       @id @default(autoincrement())
  roomId           Int
  room             Room      @relation(fields: [roomId], references: [id])
  tenantId         Int
  tenant           Tenant    @relation(fields: [tenantId], references: [id])
  userId           Int
  user             User      @relation(fields: [userId], references: [id])
  month            Int       // 1–12
  year             Int
  baseRent         Int
  electricityPrev  Int       // chỉ số điện kỳ trước
  electricityNow   Int       // chỉ số điện kỳ này
  electricityPrice Int       // VND/kWh (copy từ Room lúc tạo)
  waterPrev        Int
  waterNow         Int
  waterPrice       Int       // VND/m³
  garbageFee       Int
  otherFees        Int       @default(0)
  otherNote        String?
  periodStart      DateTime  // ngày bắt đầu kỳ tính tiền (mặc định: ngày 1 của tháng)
  periodEnd        DateTime  // ngày kết thúc kỳ tính tiền (mặc định: ngày cuối tháng)
  totalAmount      Int       // tính tự động phía backend
  paid             Boolean   @default(false)
  paidDate         DateTime?
  paidAmount       Int?      // số tiền đã thu thực tế
  // Logic: paid=true chỉ khi paidAmount >= totalAmount
  // Trả thiếu: paid=false, ghi paidAmount = số đã thu
  // Trả thừa: paid=true, ghi paidAmount = số thực thu (> totalAmount)
  note             String?
  createdAt        DateTime  @default(now())

  // Cho phép nhiều hóa đơn/phòng/tháng khi đổi khách giữa tháng
  // periodStart–periodEnd xác định chính xác kỳ tính tiền
  @@unique([roomId, tenantId, month, year])
}
```

**Công thức tính tiền (backend, không để frontend tự tính):**
```
// Số ngày ở thực tế trong kỳ
daysInPeriod   = periodEnd - periodStart + 1
daysInMonth    = số ngày của tháng đó (28/29/30/31)

// Tiền phòng tính theo ngày (pro-rata)
proRataRent    = round(baseRent × daysInPeriod / daysInMonth)

// Điện, nước tính theo chỉ số thực tế (không pro-rata)
electricCost   = (electricityNow - electricityPrev) × electricityPrice
waterCost      = (waterNow - waterPrev) × waterPrice

totalAmount    = proRataRent + electricCost + waterCost + garbageFee + otherFees
```

**Ví dụ thực tế — đổi khách ngày 15/4:**
```
Khách A (1/4 → 15/4):  15 ngày, tiền phòng = round(2,500,000 × 15/30) = 1,250,000
                        Điện: chỉ số 1/4 → chỉ số 15/4
                        → 1 hóa đơn riêng cho khách A

Khách B (16/4 → 30/4): 15 ngày, tiền phòng = round(2,500,000 × 15/30) = 1,250,000
                        Điện: chỉ số 16/4 → chỉ số 30/4
                        → 1 hóa đơn riêng cho khách B

Constraint: @@unique([roomId, tenantId, month, year]) → OK, 2 khách khác nhau
```

**Trường hợp bình thường (không đổi khách):**
- `periodStart` = ngày 1 tháng, `periodEnd` = ngày cuối tháng
- `daysInPeriod === daysInMonth` → `proRataRent === baseRent` (không thay đổi)

---

## 5. API Routes

```
# Health (không cần auth — dùng cho keep-alive ping)
GET    /api/health

# Auth
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh          → đổi refresh token lấy access token mới
GET    /api/auth/me

# Rooms
GET    /api/rooms
POST   /api/rooms
GET    /api/rooms/:id
PUT    /api/rooms/:id
DELETE /api/rooms/:id

# Tenants
GET    /api/tenants
POST   /api/tenants               → tạo + tự đổi Room.status → OCCUPIED
GET    /api/tenants/:id
PUT    /api/tenants/:id
DELETE /api/tenants/:id           → soft delete (active=false) + Room.status → AVAILABLE
POST   /api/tenants/:id/files     → upload lên Cloudinary, lưu TenantFile
DELETE /api/tenants/:id/files/:fileId

# Invoices
GET    /api/invoices              → filter: ?month=&year=&roomId=&paid=
POST   /api/invoices/bulk-create  → tạo loạt cho tháng/năm: mỗi phòng đang có người 1 hóa đơn,
                                   periodStart=ngày 1, periodEnd=ngày cuối tháng,
                                   copy electricityNow kỳ trước → electricityPrev tự động
POST   /api/invoices              → tạo thủ công 1 hóa đơn (hỗ trợ periodStart/periodEnd
                                   tùy chỉnh cho trường hợp đổi khách giữa tháng)
GET    /api/invoices/:id
PUT    /api/invoices/:id
DELETE /api/invoices/:id
PUT    /api/invoices/:id/pay      → { paidAmount } → paid=true, paidDate=now
GET    /api/invoices/:id/pdf      → trả về PDF buffer (pdf-lib)

# Export (backup thủ công)
GET    /api/export/invoices?year=   → trả về CSV toàn bộ hóa đơn theo năm

# Settings
GET    /api/settings              → lấy settings của user (tạo mặc định nếu chưa có)
PUT    /api/settings              → cập nhật tên/địa chỉ/logo nhà trọ

# Dashboard
GET    /api/dashboard/summary         → { revenue, totalRooms, occupied, available }
GET    /api/dashboard/unpaid          → danh sách Invoice chưa thu tháng hiện tại
GET    /api/dashboard/expiring        → Tenant.moveOutDate trong 30 ngày tới
GET    /api/dashboard/revenue-chart   → doanh thu 6 tháng gần nhất
GET    /api/dashboard/occupancy-chart → tỷ lệ lấp đầy 6 tháng gần nhất
```

**Mọi route (trừ auth) đều require `Authorization: Bearer <token>` và filter theo `userId`.**

---

## 6. Frontend Pages & Components

```
/login                     Đăng nhập (email + password)

/dashboard                 Tổng quan
  ├─ StatCard × 3          Doanh thu | Phòng có người | Phòng trống
  ├─ AlertList             Phòng chưa đóng tiền tháng này
  ├─ AlertList             Hợp đồng sắp hết hạn (30 ngày)
  ├─ RevenueBarChart       Recharts BarChart — doanh thu 6 tháng
  └─ OccupancyLineChart    Recharts LineChart — tỷ lệ lấp đầy 6 tháng

/rooms                     Danh sách phòng (table + status badge)
/rooms/new                 Form thêm phòng
/rooms/:id                 Chi tiết phòng + tab lịch sử hóa đơn

/tenants                   Danh sách khách thuê (table + filter active/inactive)
/tenants/new               Form thêm khách + gán phòng
/tenants/:id               Chi tiết + upload file CCCD/hợp đồng (dropzone)

/invoices                  Danh sách hóa đơn (filter tháng/năm/phòng/trạng thái)
/invoices/create           Bulk create tháng mới HOẶC tạo 1 hóa đơn thủ công
                           (thủ công: chọn phòng, khách, periodStart–periodEnd
                           → dùng khi đổi khách giữa tháng)
/invoices/:id              Nhập chỉ số điện/nước + đánh dấu thu tiền + preview PDF
/invoices/:id/pdf          Preview PDF trong trình duyệt + nút tải xuống

/settings                  Thông tin nhà trọ: tên, địa chỉ, SĐT, logo
                           (dùng để điền vào PDF hóa đơn)
```

**Component conventions:**
- Mọi form dùng `react-hook-form` + `zod` schema
- Mọi API call dùng `TanStack Query` (`useQuery` / `useMutation`)
- Toast thông báo bằng `sonner` (shadcn/ui tích hợp)
- Loading states: skeleton component, không dùng spinner toàn trang
- Error states: inline message, không full-page error

---

## 7. Error Handling

**Backend — response format chuẩn:**
```json
{ "success": false, "message": "Hóa đơn tháng này đã tồn tại", "code": "INVOICE_DUPLICATE" }
```

**Error codes quan trọng:**
- `ROOM_NOT_FOUND` — phòng không tồn tại hoặc không thuộc user
- `TENANT_NOT_FOUND` — khách thuê không tồn tại
- `INVOICE_DUPLICATE` — đã tạo hóa đơn tháng này cho phòng này
- `ROOM_OCCUPIED` — phòng đã có người khi tạo khách mới
- `VALIDATION_ERROR` — Zod validation thất bại (kèm danh sách field lỗi)
- `UNAUTHORIZED` — token hết hạn hoặc không hợp lệ

**Frontend:**
- Axios interceptor: 401 → xóa token → redirect `/login`
- TanStack Query `onError` global → hiển thị toast lỗi tiếng Việt
- Form errors hiển thị inline bên dưới từng field

---

## 8. Security

| Vấn đề | Giải pháp |
|---|---|
| Xác thực | Xem chi tiết bên dưới — có 2 phương án tùy môi trường |
| Data isolation | Mọi Prisma query đều `WHERE userId = req.user.id` |
| File upload | Chỉ nhận `image/*` và `application/pdf`, max 5MB, Cloudinary signed upload |
| Rate limiting | `express-rate-limit`: 100 req/15 phút mỗi IP |
| CORS | Chỉ cho phép `CLIENT_URL` (env variable) |
| Secrets | Không commit `.env`, quản lý qua Render/Vercel dashboard |
| Password | bcrypt hash, salt rounds = 10 |

### Chiến lược Auth — Xử lý vấn đề Cross-Domain Cookie

**Vấn đề:** Render (`.onrender.com`) và Vercel (`.vercel.app`) là 2 domain khác nhau. Trình duyệt chặn httpOnly cookie cross-domain ngay cả khi set `SameSite=None; Secure` — đặc biệt trên Safari và các trình duyệt chặn 3rd-party cookie.

**Phương án mặc định (v1) — JWT trong `Authorization` header:**
```
Access Token  → lưu memory (Zustand store, mất khi reload)
Refresh Token → lưu localStorage (chấp nhận đánh đổi bảo mật nhỏ)
```
- Axios tự gắn `Authorization: Bearer <token>` mỗi request
- Khi access token hết hạn (15 phút) → dùng refresh token gọi `/api/auth/refresh`
- Nếu refresh token hết hạn (7 ngày) → redirect `/login`
- **Trade-off:** localStorage dễ bị XSS hơn httpOnly cookie → mitigate bằng **CSP headers** trên Vercel

**Phương án nâng cấp (v2) — Custom Domain:**
```
Frontend: yourdomain.com        (Vercel custom domain)
Backend:  api.yourdomain.com    (Render custom domain)
```
- Cùng root domain → httpOnly cookie hoạt động bình thường (`SameSite=Lax`)
- Bảo mật cao nhất, không cần lo XSS với token
- Chi phí: domain ~200k–300k VND/năm

**Quyết định cho v1:** Dùng `Authorization` header + localStorage refresh token. Thêm CSP header `Content-Security-Policy: default-src 'self'` trên Vercel để giảm rủi ro XSS.

---

## 9. PDF Hóa Đơn

**Nội dung PDF (tạo bằng `pdf-lib` phía backend):**
```
[Logo nhà trọ]        HÓA ĐƠN TIỀN NHÀ THÁNG X/YYYY
[Tên nhà trọ]
[Địa chỉ, SĐT]

Phòng: 101            Khách thuê: Nguyễn Văn A
                      SĐT: 0901234567

─────────────────────────────────────────
Tiền phòng                       2,500,000
Điện: 150 × 3,500               525,000
Nước: 5 × 15,000                 75,000
Rác                               20,000
Phí khác (ghi chú)                    0
─────────────────────────────────────────
TỔNG CỘNG                      3,120,000
─────────────────────────────────────────
Trạng thái: Chưa thanh toán

Ngày lập: 21/04/2026
```

---

## 10. Deploy

**Biến môi trường:**

| Render (Backend) | Vercel (Frontend) |
|---|---|
| `DATABASE_URL` | `VITE_API_URL` |
| `JWT_SECRET` | |
| `JWT_REFRESH_SECRET` | |
| `CLOUDINARY_URL` | |
| `CLIENT_URL` | |
| `NODE_ENV=production` | |

**GitHub Actions (tùy chọn):** Auto-deploy khi push lên `main` — Render và Vercel đều hỗ trợ webhook tự động, không cần cấu hình thêm.

### Xử lý Cold Start trên Render Free Tier

Render free tier **ngủ sau 15 phút** không có request → lần đầu mở app mất 30–60 giây khởi động lại.

**Giải pháp kép:**

1. **Keep-alive cronjob** — dùng [cron-job.org](https://cron-job.org) (miễn phí) ping `GET /api/health` mỗi **14 phút** để backend không bao giờ ngủ.

2. **Wake-up UX trên frontend** — nếu request đầu tiên timeout (> 10 giây), hiển thị banner thân thiện thay vì lỗi trắng:
   ```
   ⏳ Hệ thống đang khởi động, vui lòng chờ vài giây...
   ```
   Axios timeout set 60 giây cho request đầu, sau đó quay về 15 giây.

**API endpoint cần thêm:**
```
GET /api/health   → { "status": "ok", "timestamp": "..." }  (không cần auth)
```

---

## 11. Chiến lược Backup Dữ liệu

Dữ liệu hóa đơn và tài chính **không được để mất** — Neon có Point-in-time Recovery (PITR) 7 ngày trên free tier, nhưng cần thêm lớp bảo vệ chủ động.

**Tầng 1 — Neon PITR (tự động, miễn phí):**
- Neon tự động snapshot mỗi ngày, giữ 7 ngày
- Nếu có sự cố, restore qua Neon dashboard
- Không cần cấu hình gì thêm

**Tầng 2 — Export thủ công qua UI (v1):**
- Thêm nút **"Xuất dữ liệu (CSV)"** trong `/settings`
- Export toàn bộ hóa đơn theo năm ra file CSV
- Chủ nhà tự lưu vào Google Drive hoặc máy tính
- API: `GET /api/export/invoices?year=2026` → trả về CSV

**Tầng 3 — GitHub Actions backup tự động (v2, sau MVP):**
```yaml
# .github/workflows/backup.yml
# Chạy mỗi ngày lúc 2:00 AM (UTC+7)
# Gọi /api/export/invoices → upload lên Google Drive
# qua Google Drive API + Service Account
```
> Tầng 3 là Out of Scope cho v1, nhưng được chuẩn bị sẵn API endpoint để dễ tích hợp sau.

---

## 12. Out of Scope (YAGNI)

Những tính năng **không** xây dựng trong phiên bản này:
- Đa người dùng / multi-tenant SaaS
- Gửi thông báo Zalo/SMS tự động
- Tạo hợp đồng PDF từ template
- App mobile native
- Tích hợp thanh toán online
- Backup tự động lên Google Drive (có endpoint sẵn, tích hợp tự động ở v2)

---

## 13. Success Criteria

- [ ] Chủ nhà đăng nhập, thêm phòng và khách thuê trong < 3 phút
- [ ] Tạo hóa đơn hàng loạt cho tháng mới trong < 1 phút, chỉ cần nhập chỉ số điện/nước
- [ ] Xuất PDF hóa đơn chuyên nghiệp kèm thông tin nhà trọ
- [ ] Dashboard hiển thị đủ 6 widget: 3 stat card + 2 alert list + 2 biểu đồ
- [ ] Upload file đính kèm (CCCD, hợp đồng scan) cho từng khách thuê
- [ ] Deploy hoàn toàn miễn phí, truy cập được từ internet
