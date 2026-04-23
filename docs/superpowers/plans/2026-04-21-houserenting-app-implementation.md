# House Renting App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng web app quản lý nhà trọ hoàn chỉnh — tính tiền điện/nước, quản lý khách thuê, dashboard biểu đồ, xuất PDF hóa đơn — deploy miễn phí trên Vercel + Render + Neon.

**Architecture:** Monorepo với `/frontend` (Vite+React+shadcn/ui) và `/backend` (Express+Prisma+PostgreSQL). Auth dùng JWT Bearer token, file upload qua Cloudinary, PDF tạo bằng pdf-lib.

**Tech Stack:** Node.js 20, Express 4, Prisma 5, PostgreSQL (Neon), React 18, Vite 5, TailwindCSS 3, shadcn/ui, TanStack Query 5, Zustand 4, react-hook-form + zod, Recharts 2, pdf-lib, Cloudinary, Render, Vercel

**Spec tham khảo:** `docs/superpowers/specs/2026-04-21-houserenting-app-design.md`

---

## Trạng thái thực thi (cập nhật 2026-04-22)

| Task | Trạng thái | Ghi chú |
|------|-----------|---------|
| 1 — Setup | ✅ Hoàn thành | |
| 2 — Database | ✅ Hoàn thành (local) | SQLite local cho test; PostgreSQL khi deploy |
| 3 — Auth Backend | ✅ Hoàn thành | |
| 4 — Auth Frontend | ✅ Hoàn thành | |
| 5 — Rooms Backend | ✅ Hoàn thành | |
| 6 — Rooms Frontend | ✅ Hoàn thành | |
| 7 — Tenants Backend | ✅ Hoàn thành | |
| 8 — Tenants Frontend | ✅ Hoàn thành | |
| 9 — Invoices Backend | ✅ Hoàn thành | CRUD + bulk-create + pro-rata + markPaid |
| 10 — Invoices Frontend | ✅ Hoàn thành | InvoicesPage + CreateInvoiceDialog |
| 11 — PDF | ✅ Hoàn thành | pdf-lib + @pdf-lib/fontkit + Segoe UI TTF bundled |
| 12 — Dashboard Backend | ✅ Hoàn thành | 5 endpoints: summary/unpaid/expiring/revenue-chart/occupancy-chart |
| 13 — Dashboard Frontend | ✅ Hoàn thành | StatCards + Recharts + AlertLists |
| 14 — Settings | ✅ Hoàn thành | settingsController + SettingsPage + CSV export |
| 15 — Keep-alive | ✅ Hoàn thành | /api/health + exportController |
| 16 — Deploy | ⬜ Chưa bắt đầu | Chờ WiFi tự do (mạng Bosch block Neon + GitHub) |

### Commit history hiện tại (master)
```
ca8e488  chore: gitignore db files, remove dev.db from tracking
38345c5  fix: pdf vietnamese font - bundle segoeui ttf, fix sqlite enum, fix seed
38cf505  chore: add deploy configs - vercel.json, render.yaml, .env.example
6ca036a  feat: invoices, pdf, dashboard, settings, export - tasks 9-15 complete
e6e5284  feat: rooms & tenants - backend CRUD, Cloudinary upload, frontend pages
```

### Trạng thái môi trường local (2026-04-22)
- **Backend**: chạy tại `http://localhost:5000` (`node src/index.js`)
- **Frontend**: chạy tại `http://localhost:5173` (`npm run dev`)
- **Database**: SQLite local (`backend/prisma/dev.db`) — seed sẵn `admin@test.com / password123` + 3 phòng
- **PDF**: hoạt động, dùng Segoe UI TTF bundled tại `backend/assets/fonts/`

### ⚠️ Việc cần làm khi deploy (Task 16)

**Bước 16.1 — Restore schema PostgreSQL** (trước khi push):
```prisma
# backend/prisma/schema.prisma — đổi lại:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# Thêm lại enum:
enum RoomStatus {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
}

# Đổi lại cột status trong model Room:
status  RoomStatus  @default(AVAILABLE)
```

**Bước 16.2 — Restore seed.js** (thêm lại `skipDuplicates`):
```js
await prisma.room.createMany({ data: [...], skipDuplicates: true });
```

**Bước 16.3 — Các bước deploy**:
- Kết nối WiFi cá nhân / hotspot
- Xóa migration cũ (SQLite không tương thích PostgreSQL):
  `Remove-Item -Recurse -Force backend\prisma\migrations`
- Tạo migration mới cho PostgreSQL (Neon):
  `cd backend && npx prisma migrate dev --name init`
- Push lên GitHub: `git push -u origin master`
- Tạo Render Web Service → Root: `backend`, Build: `npm install && npx prisma migrate deploy && npx prisma generate`, Start: `node src/index.js`
- Tạo Vercel Project → Root: `frontend`, Env: `VITE_API_URL=https://<backend>.onrender.com/api`
- Cập nhật Render env: `CLIENT_URL=https://<frontend>.vercel.app`
- Setup cron-job.org: ping `/api/health` mỗi 14 phút

---

## Tổng quan các Task

| Task | Module | Mô tả |
|------|--------|-------|
| 1 | Setup | Cấu hình lại monorepo, cài dependencies, xóa Mongoose |
| 2 | Database | Prisma schema + migrations + seed |
| 3 | Auth Backend | Register/Login/Refresh JWT API |
| 4 | Auth Frontend | Login page, Zustand store, Axios interceptor |
| 5 | Rooms Backend | CRUD API phòng trọ |
| 6 | Rooms Frontend | Trang danh sách + form thêm/sửa phòng |
| 7 | Tenants Backend | CRUD API khách thuê + file upload Cloudinary |
| 8 | Tenants Frontend | Trang danh sách + form + upload file |
| 9 | Invoices Backend | CRUD + bulk-create + pro-rata + tính tiền |
| 10 | Invoices Frontend | Trang danh sách + form tạo + đánh dấu thu tiền |
| 11 | PDF | Tạo PDF hóa đơn (pdf-lib) + preview |
| 12 | Dashboard Backend | 5 API endpoints thống kê |
| 13 | Dashboard Frontend | Charts, StatCards, AlertLists |
| 14 | Settings | Thông tin nhà trọ + logo + CSV export |
| 15 | Keep-alive | Health check endpoint + wake-up UX |
| 16 | Deploy | Render + Vercel + Neon + Cloudinary config |

---

## File Structure

```
houserenting-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── StatCard.jsx
│   │   │   ├── AlertList.jsx
│   │   │   ├── RoomCard.jsx
│   │   │   └── WakeUpBanner.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── RoomsPage.jsx
│   │   │   ├── RoomDetailPage.jsx
│   │   │   ├── TenantsPage.jsx
│   │   │   ├── TenantDetailPage.jsx
│   │   │   ├── InvoicesPage.jsx
│   │   │   ├── InvoiceDetailPage.jsx
│   │   │   ├── InvoiceCreatePage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance + all API calls
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useRooms.js
│   │   │   ├── useTenants.js
│   │   │   └── useInvoices.js
│   │   ├── store/
│   │   │   └── authStore.js           # Zustand auth store
│   │   ├── lib/
│   │   │   ├── utils.js               # cn(), formatCurrency(), formatDate()
│   │   │   └── validations.js         # Zod schemas
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx          # Sidebar + header wrapper
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js
    ├── src/
    │   ├── config/
    │   │   └── db.js                  # Prisma client singleton
    │   ├── middlewares/
    │   │   ├── authMiddleware.js       # JWT verify
    │   │   └── errorHandler.js        # Global error handler
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── roomRoutes.js
    │   │   ├── tenantRoutes.js
    │   │   ├── invoiceRoutes.js
    │   │   ├── dashboardRoutes.js
    │   │   ├── settingsRoutes.js
    │   │   └── exportRoutes.js
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── roomController.js
    │   │   ├── tenantController.js
    │   │   ├── invoiceController.js
    │   │   ├── dashboardController.js
    │   │   ├── settingsController.js
    │   │   ├── exportController.js
    │   │   └── pdfController.js
    │   ├── services/
    │   │   ├── invoiceService.js      # Pro-rata logic, tính totalAmount
    │   │   ├── pdfService.js          # pdf-lib template
    │   │   └── cloudinaryService.js   # Upload helper
    │   └── index.js
    ├── .env
    └── package.json
```

---

## Task 1: Setup — Cấu hình lại Monorepo

**Files:**
- Modify: `backend/package.json`
- Delete: `backend/src/models/` (toàn bộ Mongoose models)
- Create: `backend/prisma/schema.prisma`
- Create: `backend/.env`

- [x] **Bước 1.1: Xóa Mongoose khỏi backend**

```bash
cd backend
npm uninstall mongoose
```

- [x] **Bước 1.2: Cài Prisma + PostgreSQL driver**

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

Expected: tạo `prisma/schema.prisma` và thêm `DATABASE_URL` vào `.env`

- [x] **Bước 1.3: Cài các dependencies còn thiếu cho backend**

```bash
npm install zod express-rate-limit multer cloudinary pdf-lib jsonwebtoken bcryptjs cors dotenv
npm install -D nodemon
```

- [x] **Bước 1.4: Cài dependencies cho frontend**

```bash
cd ../frontend
npm install @tanstack/react-query zustand react-router-dom react-hook-form zod @hookform/resolvers axios recharts sonner
npm install -D @types/node
npx shadcn@latest init
```

Khi `shadcn init` hỏi: style=Default, base color=Slate, CSS variables=Yes

- [x] **Bước 1.5: Cài shadcn components cần thiết**

> **Lưu ý:** `toast` component không còn trong shadcn registry (dùng `sonner` thay thế). `form` component bị lỗi registry tạm thời — sẽ cài lại khi cần ở Task 4.

```bash
npx shadcn@latest add button input label card table badge dialog sheet form select textarea toast skeleton
```

- [x] **Bước 1.6: Xóa Mongoose models cũ**

```bash
cd ../backend
rm -rf src/models
```

- [x] **Bước 1.7: Commit**

```bash
cd ..
git add -A
git commit -m "chore: replace mongoose with prisma, install all dependencies"
```

---

## Task 2: Database — Prisma Schema & Migration

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma/seed.js`
- Create: `backend/src/config/db.js`

- [x] **Bước 2.1: Viết Prisma schema**

> **Lưu ý Prisma v7:** `datasource.url` không còn được phép trong `schema.prisma`. URL đã được chuyển sang `prisma.config.ts` (đã được tạo tự động bởi `prisma init` và điền `DATABASE_URL` từ `.env`).

Nội dung file `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int            @id @default(autoincrement())
  email         String         @unique
  password      String
  name          String
  createdAt     DateTime       @default(now())
  rooms         Room[]
  invoices      Invoice[]
  refreshTokens RefreshToken[]
  settings      Settings?
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Settings {
  id        Int      @id @default(autoincrement())
  userId    Int      @unique
  user      User     @relation(fields: [userId], references: [id])
  shopName  String   @default("Nhà trọ")
  address   String   @default("")
  phone     String   @default("")
  logoUrl   String?
  updatedAt DateTime @updatedAt
}

enum RoomStatus {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
}

model Room {
  id            Int        @id @default(autoincrement())
  name          String
  floor         Int?
  area          Float?
  baseRent      Int
  electricPrice Int        @default(3500)
  waterPrice    Int        @default(15000)
  garbageFee    Int        @default(20000)
  status        RoomStatus @default(AVAILABLE)
  userId        Int
  user          User       @relation(fields: [userId], references: [id])
  tenants       Tenant[]
  invoices      Invoice[]
  createdAt     DateTime   @default(now())
}

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

model TenantFile {
  id        Int      @id @default(autoincrement())
  tenantId  Int
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  label     String
  url       String
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
  month            Int
  year             Int
  baseRent         Int
  electricityPrev  Int
  electricityNow   Int
  electricityPrice Int
  waterPrev        Int
  waterNow         Int
  waterPrice       Int
  garbageFee       Int
  otherFees        Int       @default(0)
  otherNote        String?
  periodStart      DateTime
  periodEnd        DateTime
  totalAmount      Int
  paid             Boolean   @default(false)
  paidDate         DateTime?
  paidAmount       Int?
  note             String?
  createdAt        DateTime  @default(now())

  @@unique([roomId, tenantId, month, year])
}
```

- [x] **Bước 2.2: Tạo Prisma client singleton**

Nội dung file `backend/src/config/db.js`:

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;
```

- [x] **Bước 2.3: Tạo Neon database**

> `DATABASE_URL` đã được điền vào `backend/.env`. Project: `ep-misty-moon-amxes65u`, region: `us-east-1`.

1. Truy cập https://neon.tech → Sign up miễn phí
2. Tạo project mới → copy connection string
3. Dán vào `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="change-this-to-random-64-char-string"
JWT_REFRESH_SECRET="change-this-to-another-random-64-char-string"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
PORT=5000
```

- [ ] **Bước 2.4: Chạy migration** ⚠️ BLOCKED

```bash
cd backend
npx prisma migrate dev --name init
```

Expected output: `✔ Generated Prisma Client` + migration file tạo trong `prisma/migrations/`

> **Blocked:** Mạng Bosch chặn DNS cho `*.neon.tech`. Cần chạy lại lệnh này khi dùng WiFi cá nhân / hotspot / VPN cho phép.

- [x] **Bước 2.5: Viết seed file**

Nội dung `backend/prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashed,
      name: 'Chủ nhà Test',
      settings: { create: { shopName: 'Nhà trọ Hoa Hồng', address: '123 Đường ABC', phone: '0901234567' } },
    },
  });
  console.log('Seeded user:', user.email);

  await prisma.room.createMany({
    data: [
      { name: 'Phòng 101', floor: 1, area: 20, baseRent: 2500000, userId: user.id },
      { name: 'Phòng 102', floor: 1, area: 18, baseRent: 2200000, userId: user.id },
      { name: 'Phòng 201', floor: 2, area: 25, baseRent: 3000000, userId: user.id },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded 3 rooms');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

Thêm vào `backend/package.json`:

```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

- [ ] **Bước 2.6: Chạy seed** ⚠️ BLOCKED

```bash
npx prisma db seed
```

Expected: `Seeded user: admin@test.com` + `Seeded 3 rooms`

> **Blocked:** Phụ thuộc vào Bước 2.4 (cần kết nối Neon).

- [x] **Bước 2.7: Commit**

> Commit thực tế: `feat: add prisma schema, neon db config, seed data`

```bash
git add -A
git commit -m "feat: add prisma schema, neon db connection, seed data"
```

---

## Task 3: Auth Backend

**Files:**
- Create: `backend/src/controllers/authController.js`
- Create: `backend/src/routes/authRoutes.js`
- Create: `backend/src/middlewares/authMiddleware.js`
- Create: `backend/src/middlewares/errorHandler.js`
- Modify: `backend/src/index.js`

- [x] **Bước 3.1: Viết errorHandler middleware**

Nội dung `backend/src/middlewares/errorHandler.js`:

```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Lỗi server',
    code: err.code || 'SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  const err = new Error(`Không tìm thấy route: ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
```

- [x] **Bước 3.2: Viết authMiddleware**

Nội dung `backend/src/middlewares/authMiddleware.js`:

```javascript
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Không có quyền truy cập', code: 'UNAUTHORIZED' });
  }
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });
    if (!req.user) return res.status(401).json({ success: false, message: 'Người dùng không tồn tại', code: 'UNAUTHORIZED' });
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn', code: 'UNAUTHORIZED' });
  }
};

module.exports = protect;
```

- [x] **Bước 3.3: Viết authController**

Nội dung `backend/src/controllers/authController.js`:

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const genAccessToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
const genRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin', code: 'VALIDATION_ERROR' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ success: false, message: 'Email đã được sử dụng', code: 'EMAIL_TAKEN' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, settings: { create: {} } },
    });
    const accessToken = genAccessToken(user.id);
    const refreshToken = genRefreshToken(user.id);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
    res.status(201).json({ success: true, accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng', code: 'INVALID_CREDENTIALS' });
    }
    const accessToken = genAccessToken(user.id);
    const refreshToken = genRefreshToken(user.id);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
    res.json({ success: true, accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Thiếu refresh token', code: 'UNAUTHORIZED' });
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Refresh token hết hạn, vui lòng đăng nhập lại', code: 'UNAUTHORIZED' });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = genAccessToken(decoded.id);
    res.json({ success: true, accessToken });
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    res.json({ success: true, message: 'Đăng xuất thành công' });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
```

- [x] **Bước 3.4: Viết authRoutes**

Nội dung `backend/src/routes/authRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, getMe } = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
```

- [x] **Bước 3.5: Cập nhật backend/src/index.js**

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Health check (public — dùng cho keep-alive ping)
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

- [x] **Bước 3.6: Test auth API**

> `GET /api/health` trả `{"status":"ok"}` thành công. Auth endpoints (login/register) chưa test thực được vì blocked DB — sẽ kiểm tra sau khi unblock Bước 2.4.

```bash
cd backend
npm run dev
# Trong terminal khác:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

Expected: `{ "success": true, "accessToken": "...", "refreshToken": "...", "user": {...} }`

- [x] **Bước 3.7: Commit**

> Commit thực tế: `feat: auth backend - register, login, refresh token, logout; downgrade prisma to v5`
>
> **Lưu ý:** Prisma đã downgrade từ v7 → v5 (v7 có breaking change: bỏ `datasource.url` trong schema, yêu cầu driver adapter). V5 là phiên bản plan yêu cầu.

```bash
git add -A
git commit -m "feat: auth backend - register, login, refresh token, logout"
```

---

## Task 4: Auth Frontend

**Files:**
- Create: `frontend/src/store/authStore.js`
- Create: `frontend/src/services/api.js`
- Create: `frontend/src/pages/LoginPage.jsx`
- Create: `frontend/src/lib/utils.js`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/main.jsx`

- [x] **Bước 4.1: Viết Zustand auth store**

Nội dung `frontend/src/store/authStore.js`:

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ refreshToken: state.refreshToken, user: state.user }),
    }
  )
);

export default useAuthStore;
```

- [x] **Bước 4.2: Viết Axios API service**

Nội dung `frontend/src/services/api.js`:

```javascript
import axios from 'axios';
import useAuthStore from '../store/authStore';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // 60s cho cold start lần đầu
});

API.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failQueue = [];
const processQueue = (error, token = null) => {
  failQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failQueue = [];
};

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failQueue.push({ resolve, reject }))
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return API(original); });
      }
      original._retry = true;
      isRefreshing = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      try {
        const res = await axios.post(`${API.defaults.baseURL}/auth/refresh`, { refreshToken });
        const newToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return API(original);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginApi = (data) => API.post('/auth/login', data);
export const registerApi = (data) => API.post('/auth/register', data);
export const logoutApi = (data) => API.post('/auth/logout', data);
export const getMeApi = () => API.get('/auth/me');

// Rooms
export const getRoomsApi = () => API.get('/rooms');
export const getRoomApi = (id) => API.get(`/rooms/${id}`);
export const createRoomApi = (data) => API.post('/rooms', data);
export const updateRoomApi = (id, data) => API.put(`/rooms/${id}`, data);
export const deleteRoomApi = (id) => API.delete(`/rooms/${id}`);

// Tenants
export const getTenantsApi = () => API.get('/tenants');
export const getTenantApi = (id) => API.get(`/tenants/${id}`);
export const createTenantApi = (data) => API.post('/tenants', data);
export const updateTenantApi = (id, data) => API.put(`/tenants/${id}`, data);
export const deleteTenantApi = (id) => API.delete(`/tenants/${id}`);
export const uploadTenantFileApi = (id, formData) => API.post(`/tenants/${id}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteTenantFileApi = (tenantId, fileId) => API.delete(`/tenants/${tenantId}/files/${fileId}`);

// Invoices
export const getInvoicesApi = (params) => API.get('/invoices', { params });
export const getInvoiceApi = (id) => API.get(`/invoices/${id}`);
export const createInvoiceApi = (data) => API.post('/invoices', data);
export const bulkCreateInvoicesApi = (data) => API.post('/invoices/bulk-create', data);
export const updateInvoiceApi = (id, data) => API.put(`/invoices/${id}`, data);
export const deleteInvoiceApi = (id) => API.delete(`/invoices/${id}`);
export const markInvoicePaidApi = (id, data) => API.put(`/invoices/${id}/pay`, data);
export const getInvoicePdfApi = (id) => API.get(`/invoices/${id}/pdf`, { responseType: 'blob' });

// Dashboard
export const getDashboardSummaryApi = () => API.get('/dashboard/summary');
export const getUnpaidInvoicesApi = () => API.get('/dashboard/unpaid');
export const getExpiringTenantsApi = () => API.get('/dashboard/expiring');
export const getRevenueChartApi = () => API.get('/dashboard/revenue-chart');
export const getOccupancyChartApi = () => API.get('/dashboard/occupancy-chart');

// Settings
export const getSettingsApi = () => API.get('/settings');
export const updateSettingsApi = (data) => API.put('/settings', data);

// Export
export const exportInvoicesCsvApi = (year) => API.get(`/export/invoices?year=${year}`, { responseType: 'blob' });

export default API;
```

- [x] **Bước 4.3: Viết LoginPage**

Nội dung `frontend/src/pages/LoginPage.jsx`:

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginApi } from '../services/api';
import useAuthStore from '../store/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      setAuth(res.data.accessToken, res.data.refreshToken, res.data.user);
      navigate('/dashboard');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Đăng nhập thất bại'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(mutate)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@test.com" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [x] **Bước 4.4: Viết WakeUpBanner component**

Nội dung `frontend/src/components/WakeUpBanner.jsx`:

```jsx
import { useState, useEffect } from 'react';
import API from '../services/api';

export default function WakeUpBanner() {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaking(true), 10000); // hiện sau 10s
    API.get('/health').then(() => clearTimeout(timer)).catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  if (!waking) return null;
  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-100 border-b border-amber-300 text-amber-800 text-sm text-center py-2 z-50">
      ⏳ Hệ thống đang khởi động, vui lòng chờ vài giây...
    </div>
  );
}
```

- [x] **Bước 4.5: Cập nhật main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

- [x] **Bước 4.6: Cập nhật App.jsx với routing**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import TenantsPage from './pages/TenantsPage';
import InvoicesPage from './pages/InvoicesPage';
import SettingsPage from './pages/SettingsPage';
import AppLayout from './layouts/AppLayout';
import WakeUpBanner from './components/WakeUpBanner';

function PrivateRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <WakeUpBanner />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="rooms/*" element={<RoomsPage />} />
          <Route path="tenants/*" element={<TenantsPage />} />
          <Route path="invoices/*" element={<InvoicesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}
```

- [x] **Bước 4.7: Test frontend chạy được**

> `vite build` thành công (302 modules). Login/redirect cần test thực sau khi unblock DB (Bước 2.4).

```bash
cd frontend
npm run dev
```

Expected: Mở http://localhost:5173 → hiện trang Login, đăng nhập với `admin@test.com / password123` → redirect sang `/dashboard`

- [x] **Bước 4.8: Commit**

```bash
git add -A
git commit -m "feat: auth frontend - login page, zustand store, axios interceptor with refresh"
```

---

## Task 5: Rooms Backend

**Files:**
- Create: `backend/src/controllers/roomController.js`
- Create: `backend/src/routes/roomRoutes.js`

- [x] **Bước 5.1: Viết roomController**

Nội dung `backend/src/controllers/roomController.js`:

```javascript
const prisma = require('../config/db');

exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { userId: req.user.id },
      include: {
        tenants: { where: { active: true }, select: { id: true, name: true, phone: true } },
        _count: { select: { invoices: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: rooms });
  } catch (err) { next(err); }
};

exports.getRoomById = async (req, res, next) => {
  try {
    const room = await prisma.room.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
      include: {
        tenants: { where: { active: true } },
        invoices: { orderBy: { createdAt: 'desc' }, take: 12, include: { tenant: { select: { name: true } } } },
      },
    });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng', code: 'ROOM_NOT_FOUND' });
    res.json({ success: true, data: room });
  } catch (err) { next(err); }
};

exports.createRoom = async (req, res, next) => {
  try {
    const { name, floor, area, baseRent, electricPrice, waterPrice, garbageFee } = req.body;
    if (!name || !baseRent) return res.status(400).json({ success: false, message: 'Tên phòng và giá thuê là bắt buộc', code: 'VALIDATION_ERROR' });
    const room = await prisma.room.create({
      data: { name, floor, area, baseRent: Number(baseRent), electricPrice: Number(electricPrice || 3500), waterPrice: Number(waterPrice || 15000), garbageFee: Number(garbageFee || 20000), userId: req.user.id },
    });
    res.status(201).json({ success: true, data: room });
  } catch (err) { next(err); }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await prisma.room.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng', code: 'ROOM_NOT_FOUND' });
    const updated = await prisma.room.update({ where: { id: room.id }, data: req.body });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await prisma.room.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng', code: 'ROOM_NOT_FOUND' });
    if (room.status === 'OCCUPIED') return res.status(400).json({ success: false, message: 'Không thể xóa phòng đang có người ở', code: 'ROOM_OCCUPIED' });
    await prisma.room.delete({ where: { id: room.id } });
    res.json({ success: true, message: 'Xóa phòng thành công' });
  } catch (err) { next(err); }
};
```

- [x] **Bước 5.2: Viết roomRoutes**

Nội dung `backend/src/routes/roomRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const c = require('../controllers/roomController');

router.use(protect);
router.route('/').get(c.getRooms).post(c.createRoom);
router.route('/:id').get(c.getRoomById).put(c.updateRoom).delete(c.deleteRoom);

module.exports = router;
```

- [x] **Bước 5.3: Test room API**

```bash
# Lấy access token từ login trước
TOKEN="<accessToken từ bước 3.6>"
curl http://localhost:5000/api/rooms -H "Authorization: Bearer $TOKEN"
```

Expected: `{ "success": true, "data": [...3 phòng từ seed...] }`

- [ ] **Bước 5.4: Commit**

```bash
git add -A
git commit -m "feat: rooms backend CRUD API"
```

---

## Task 6: Rooms Frontend

**Files:**
- Create: `frontend/src/pages/RoomsPage.jsx`
- Create: `frontend/src/layouts/AppLayout.jsx`

- [x] **Bước 6.1: Viết AppLayout với sidebar**

Nội dung `frontend/src/layouts/AppLayout.jsx`:

```jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, BedDouble, Users, FileText, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { logoutApi } from '../services/api';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Tổng quan' },
  { to: '/rooms', icon: BedDouble, label: 'Phòng trọ' },
  { to: '/tenants', icon: Users, label: 'Khách thuê' },
  { to: '/invoices', icon: FileText, label: 'Hóa đơn' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function AppLayout() {
  const { user, refreshToken, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutApi({ refreshToken }).catch(() => {});
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-56 bg-white shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg text-gray-800">🏠 Quản lý nhà trọ</h1>
          <p className="text-xs text-gray-500 mt-1">{user?.name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`
              }>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full transition-colors">
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

- [x] **Bước 6.2: Viết RoomsPage**

Nội dung `frontend/src/pages/RoomsPage.jsx`:

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoomsApi, deleteRoomApi } from '../services/api';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const STATUS_MAP = {
  AVAILABLE: { label: 'Trống', variant: 'secondary' },
  OCCUPIED: { label: 'Có người', variant: 'default' },
  MAINTENANCE: { label: 'Bảo trì', variant: 'destructive' },
};

export default function RoomsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['rooms'], queryFn: () => getRoomsApi().then(r => r.data.data) });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteRoomApi(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Đã xóa phòng'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Xóa thất bại'),
  });

  if (isLoading) return <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"/>)}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Phòng trọ</h1>
        <Button>+ Thêm phòng</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map(room => (
          <div key={room.id} className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{room.name}</h3>
              <Badge variant={STATUS_MAP[room.status].variant}>{STATUS_MAP[room.status].label}</Badge>
            </div>
            <p className="text-gray-500 text-sm">{room.area ? `${room.area}m²` : ''} {room.floor ? `• Tầng ${room.floor}` : ''}</p>
            <p className="font-medium text-blue-700 mt-1">{room.baseRent.toLocaleString('vi-VN')} đ/tháng</p>
            {room.tenants[0] && <p className="text-sm text-gray-600 mt-1">👤 {room.tenants[0].name}</p>}
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">Chi tiết</Button>
              <Button size="sm" variant="destructive" onClick={() => window.confirm('Xác nhận xóa?') && deleteMutation.mutate(room.id)}>Xóa</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [x] **Bước 6.3: Cài lucide-react cho icons**

```bash
cd frontend
npm install lucide-react
```

- [x] **Bước 6.4: Test giao diện phòng**

```bash
npm run dev
```

Expected: Đăng nhập → sidebar hiển thị → vào `/rooms` thấy 3 phòng từ seed với badge trạng thái

- [x] **Bước 6.5: Commit**

```bash
git add -A
git commit -m "feat: rooms frontend - list view with status badges, sidebar layout"
```

---

## Task 7–14: Các module còn lại

> **Ghi chú cho developer:** Task 7–14 tiếp tục theo cùng pattern:
> - Backend: controller → routes → test API → commit
> - Frontend: page component → custom hook → test UI → commit
>
> Xem chi tiết từng task trong file:
> `docs/superpowers/plans/tasks/task-07-tenants.md`
> `docs/superpowers/plans/tasks/task-08-tenants-frontend.md`
> `docs/superpowers/plans/tasks/task-09-invoices-backend.md`
> `docs/superpowers/plans/tasks/task-10-invoices-frontend.md`
> `docs/superpowers/plans/tasks/task-11-pdf.md`
> `docs/superpowers/plans/tasks/task-12-dashboard-backend.md`
> `docs/superpowers/plans/tasks/task-13-dashboard-frontend.md`
> `docs/superpowers/plans/tasks/task-14-settings.md`
> `docs/superpowers/plans/tasks/task-15-keepalive.md`
> `docs/superpowers/plans/tasks/task-16-deploy.md`

---

## Task 9 Summary: invoiceService — Pro-rata Logic

File: `backend/src/services/invoiceService.js`

```javascript
function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate(); // month là 1-based, JS Date tự xử lý
}

function calcInvoiceTotal({ baseRent, periodStart, periodEnd, month, year,
  electricityNow, electricityPrev, electricityPrice,
  waterNow, waterPrev, waterPrice, garbageFee, otherFees }) {

  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const daysInPeriod = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const daysInMonth = getDaysInMonth(month, year);

  const proRataRent = Math.round(baseRent * daysInPeriod / daysInMonth);
  const electricCost = (electricityNow - electricityPrev) * electricityPrice;
  const waterCost = (waterNow - waterPrev) * waterPrice;

  return proRataRent + electricCost + waterCost + garbageFee + (otherFees || 0);
}

module.exports = { calcInvoiceTotal, getDaysInMonth };
```

---

## Task 16 Summary: Deploy Checklist

- [ ] **16.1** Tạo Neon account → tạo database → copy `DATABASE_URL`
- [ ] **16.2** Tạo Cloudinary account → copy `CLOUD_NAME`, `API_KEY`, `API_SECRET`
- [ ] **16.3** Push code lên GitHub (public hoặc private repo)
- [ ] **16.4** Tạo Render Web Service → kết nối GitHub repo → set Root Directory = `backend`
  - Build Command: `npm install && npx prisma migrate deploy`
  - Start Command: `node src/index.js`
  - Thêm tất cả env variables từ `.env`
- [ ] **16.5** Tạo Vercel project → kết nối GitHub repo → set Root Directory = `frontend`
  - Thêm env: `VITE_API_URL=https://your-backend.onrender.com/api`
- [ ] **16.6** Cập nhật Render env: `CLIENT_URL=https://your-frontend.vercel.app`
- [ ] **16.7** Setup cron-job.org: ping `GET https://your-backend.onrender.com/api/health` mỗi 14 phút
- [ ] **16.8** Test toàn bộ luồng: Login → Thêm phòng → Thêm khách → Tạo hóa đơn → PDF

---

## Hướng dẫn mở chat mới

Khi context window đầy, mở chat mới và dán đoạn sau:

```
Tôi đang xây dựng dự án House Renting App.

SPEC: docs/superpowers/specs/2026-04-21-houserenting-app-design.md
PLAN: docs/superpowers/plans/2026-04-21-houserenting-app-implementation.md

Tech stack: Vite+React, Node.js+Express, Prisma+PostgreSQL(Neon), shadcn/ui, TanStack Query, Zustand, Recharts, pdf-lib, Cloudinary. Deploy: Vercel(frontend) + Render(backend).

Task hiện tại đang làm: [ĐIỀN VÀO ĐÂY — ví dụ: Task 7 - Tenants Backend]
Bước đang làm: [ĐIỀN VÀO ĐÂY — ví dụ: Bước 7.2]

Hãy tiếp tục từ bước này theo đúng plan.
```
