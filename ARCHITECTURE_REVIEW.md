# Architecture Review — House Renting App

**Reviewer:** Senior Software Architect (AI-assisted)
**Date:** June 1, 2026
**Version reviewed:** 1.4.5
**Scope:** Full-stack monorepo — `backend/` (Node.js/Express/Prisma) + `frontend/` (Vite/React/TanStack Query)

---

## Table of Contents

1. [Architecture Strengths](#1-architecture-strengths)
2. [Architecture Weaknesses](#2-architecture-weaknesses)
3. [Technical Debt](#3-technical-debt)
4. [Scalability Risks](#4-scalability-risks)
5. [Refactoring Recommendations](#5-refactoring-recommendations)
6. [Risk Summary Matrix](#6-risk-summary-matrix)

---

## 1. Architecture Strengths

### 1.1 Clean Separation of Concerns

The backend follows a textbook layered architecture: **Routes → Controllers → Services → ORM**. Business logic is correctly extracted into `invoiceService.js` (pro-rata calculation) and `cloudinaryService.js` (file storage abstraction). The `notificationService.js` isolates webhook delivery. This makes each layer independently testable and replaceable.

### 1.2 Consistent API Contract

Every endpoint returns a uniform envelope `{ success, data?, message?, code? }`. Error codes are domain-specific strings (`ROOM_NOT_FOUND`, `INVOICE_DUPLICATE`, `ROOM_OCCUPIED`) rather than raw HTTP status codes. This makes frontend error handling predictable and enables future i18n of error messages without touching API consumers.

### 1.3 Solid Authentication Architecture

The dual-token JWT pattern (15-minute access token + 7-day refresh token stored in the database) is correctly implemented:

- Access tokens are kept **in-memory only** in Zustand (not persisted to localStorage), preventing XSS token theft.
- Refresh tokens are persisted to localStorage but also stored server-side, enabling server-side revocation.
- The Axios interceptor implements a **fail queue** pattern to prevent multiple simultaneous refresh calls — a subtle but important correctness detail.
- Logout properly deletes the refresh token from the database.

### 1.4 Ownership Isolation at the Data Layer

Every Prisma query that touches user data includes `userId: req.user.id` as a filter condition. This means even if an attacker guesses a resource ID, they cannot access another user's data. This is the correct pattern for a multi-tenant single-database architecture.

### 1.5 Transactional Cascade Deletion

The `deleteRoom` controller uses `prisma.$transaction([...])` with a carefully ordered sequence (Invoices → TenantFiles → Tenants → Room) to maintain referential integrity. This was a deliberate fix (Patch 1.4.1) and is correctly implemented.

### 1.6 Pro-Rata Billing Logic is Isolated and Tested

The `calculateTotal` function in `invoiceService.js` is a pure function with no side effects. The pro-rata rent calculation (`baseRent × daysInPeriod / daysInMonth`) is mathematically correct and the logic is reused consistently between single-invoice creation, bulk creation, and invoice updates. The unit tests in `pdfController.test.js` cover the VietQR generation logic with edge cases (null amounts, float rounding, ASCII normalization, CRC-16 checksum).

### 1.7 Frontend State Management is Well-Structured

The split between **Zustand** (auth/client state) and **TanStack Query** (server state) is architecturally sound. Query keys are consistent and granular (`['rooms']`, `['room', id]`, `['invoices', params]`). Cache invalidation after mutations is handled correctly with `invalidateQueries`. The `staleTime: 30000ms` default prevents unnecessary refetches.

### 1.8 Skeleton Loading States

Every page has a corresponding skeleton component (`SkeletonCard`, `SkeletonTable`, `SkeletonDashboard`, `SkeletonDetail`). This is a UX best practice that prevents layout shift and communicates loading state clearly.

### 1.9 E2E Test Coverage of the Critical Path

The Playwright test suite covers the full business cycle: login → create room → add tenant → bulk invoice creation → payment verification → tenant checkout → room status reset. The test uses `data-testid` attributes (not CSS selectors), making it resilient to UI redesigns. The `workers: 1` sequential configuration prevents database race conditions.

### 1.10 Two-Tier QR Strategy

The static QR PNG priority with dynamic VietQR EMVCo fallback is a pragmatic solution to the real-world problem of bank app QR codes being more reliable than programmatically generated ones. The fallback correctly implements the full EMVCo MPM specification including CRC-16/CCITT checksum.

### 1.11 WakeUpBanner for Cold Start UX

The `WakeUpBanner` component that pings `/api/health` and shows a banner after 10 seconds is a thoughtful UX solution for the Render free-tier cold start problem. It sets user expectations without blocking the UI.

---

## 2. Architecture Weaknesses

### 2.1 N+1 Query Problem in Dashboard Chart Endpoints

**Severity: High**

`getRevenueChart` and `getOccupancyChart` both execute a loop of 6 sequential database queries:

```js
// dashboardController.js — runs 6 separate queries
for (let i = 5; i >= 0; i--) {
  const invoices = await prisma.invoice.findMany({ where: { userId, month, year, paid: true } });
}
```

This is a classic N+1 pattern. On a cold Neon serverless connection, each query incurs a round-trip latency. The dashboard makes **5 parallel API calls** on load, two of which each fire 6 sequential queries — meaning the dashboard can trigger up to 12 sequential database round-trips just for the charts.

**Fix:** Use a single `GROUP BY month, year` aggregation query via `prisma.$queryRaw` or Prisma's `groupBy`.

### 2.2 `bulkCreateInvoices` is Not Atomic

**Severity: High**

The bulk invoice creation loops through rooms and calls `prisma.invoice.create()` individually inside a `for` loop. If the process crashes or the database connection drops mid-loop, some rooms will have invoices and others won't, leaving the system in an inconsistent state with no way to detect or recover.

```js
// invoiceController.js — not wrapped in a transaction
for (const room of rooms) {
  // ...
  const invoice = await prisma.invoice.create({ data: { ... } });
  created.push(invoice);
}
```

**Fix:** Wrap the entire bulk creation in `prisma.$transaction([...])` or use `prisma.invoice.createMany()` with `skipDuplicates: true`.

### 2.3 Auth Middleware Performs a Database Lookup on Every Request

**Severity: Medium**

```js
// authMiddleware.js — DB query on every authenticated request
req.user = await prisma.user.findUnique({ where: { id: decoded.id }, ... });
```

Every API call hits the database to fetch the user record, even though the JWT already contains the user ID. On a serverless database like Neon, this adds latency to every request and consumes connection pool slots.

**Fix:** Embed `{ id, email, name }` in the JWT payload at login time. The middleware can then set `req.user = decoded` without a DB lookup. Only perform the DB lookup if you need to verify the user still exists (e.g., after account deletion — which is not a current feature).

### 2.4 `RequireAuth` Guards on `refreshToken`, Not `accessToken`

**Severity: Medium**

```js
// App.jsx
function RequireAuth({ children }) {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  if (!refreshToken) return <Navigate to="/login" replace />;
  return children;
}
```

The guard checks for the presence of a `refreshToken` in localStorage. This means:
- A user with an **expired refresh token** (7 days old) will still see the app and only get redirected to login after the first API call fails.
- A user whose refresh token was **revoked server-side** (e.g., after a security incident) will still see the app until the first API call.

This is a minor UX issue but could be confusing. The access token expiry (15 minutes) means the user will be silently refreshed or logged out on the first API call, so the practical impact is low.

### 2.5 No Input Validation on the Backend for Most Endpoints

**Severity: Medium**

The backend uses manual `if (!name || !baseRent)` checks in some controllers but has no systematic validation layer. The `zod` package is listed as a dependency but is not used for request validation. For example:

- `createRoom`: Only checks `name` and `baseRent` are present; `electricPrice`, `waterPrice`, `garbageFee` are accepted as any value.
- `createInvoice`: `electricityPrev`, `electricityNow`, `waterPrev`, `waterNow` are cast with `Number()` but not validated for range (negative values would produce negative electricity costs).
- `updateSettings`: Accepts any string for `webhookUrl` without URL format validation.

**Fix:** Add a Zod validation middleware (e.g., `express-zod-api` or a custom `validate(schema)` middleware) and define schemas for all request bodies.

### 2.6 `ensureDatabaseSchema` Runtime Migration is an Anti-Pattern

**Severity: Medium**

```js
// index.js — runs on every server startup
const ensureDatabaseSchema = async () => {
  await prisma.$executeRawUnsafe('ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "paymentInfo" TEXT;');
};
```

Running DDL statements on every server startup is fragile and bypasses Prisma's migration system. If the column already exists (which it will after the first run), this is a no-op, but it adds startup latency and could cause issues if the database user lacks DDL permissions in a hardened production environment. The `paymentInfo` column is already defined in `schema.prisma` and should be managed exclusively through `prisma migrate`.

**Fix:** Remove `ensureDatabaseSchema()` from `index.js`. Ensure the migration `20260428000000_add_payment_info` is applied as part of the deployment process.

### 2.7 Cloudinary `publicId` is Not Stored for File Deletion

**Severity: Medium**

```js
// tenantController.js — stores only the URL, not the publicId
const file = await prisma.tenantFile.create({
  data: { tenantId: tenant.id, label, url: result.secure_url },
});
```

When a file is deleted, the controller calls `prisma.tenantFile.delete()` but **does not call `deleteFromCloudinary()`**. The file is removed from the database but remains in Cloudinary storage indefinitely, accumulating storage costs and orphaned assets.

```js
// tenantController.js deleteFile — missing Cloudinary cleanup
await prisma.tenantFile.delete({ where: { id: file.id } });
// ❌ deleteFromCloudinary(file.publicId) is never called
```

**Fix:** Store `result.public_id` in a `publicId` column on `TenantFile`. Call `deleteFromCloudinary(file.publicId)` before deleting the database record.

### 2.8 Hardcoded Test Credentials in the Login Page UI

**Severity: Low (but a security concern for production)**

```jsx
// LoginPage.jsx — credentials visible in production UI
<p>Email: <code>admin@test.com</code></p>
<p>Mật khẩu: <code>password123</code></p>
```

The "demo account" credentials are hardcoded in the login page JSX and will be visible in the production build. This is acceptable for a demo/personal app but should be removed or gated behind `import.meta.env.DEV` before any public deployment.

---

## 3. Technical Debt

### 3.1 No Pagination on Any List Endpoint

All list endpoints (`/rooms`, `/tenants`, `/invoices`) return the full dataset. For the target scale of 5–20 rooms this is acceptable, but the invoice list will grow unboundedly over time. A landlord with 20 rooms over 5 years will accumulate 1,200+ invoices, all returned in a single query.

**Debt:** Add `skip`/`take` pagination parameters to `/invoices` at minimum, since it's the highest-growth endpoint.

### 3.2 `pdfController.js` is a God Object

At ~300 lines, `pdfController.js` contains: PDF layout logic, font discovery, QR image generation, bank BIN mapping (50+ entries), payment info parsing, VietQR string building, and CRC-16 calculation. This is a single file doing six distinct jobs.

**Debt:** Extract into separate modules:
- `services/pdfService.js` — PDF layout and rendering
- `services/vietQrService.js` — `parsePaymentInfo`, `buildVietQRString`, `bankBinMap`
- `utils/crc16.js` — CRC-16/CCITT implementation

### 3.3 Dashboard Makes 5 Parallel API Calls on Every Load

```js
// DashboardPage.jsx — 5 simultaneous queries
const { data: summaryRes } = useQuery({ queryKey: ['dashboard-summary'], ... });
const { data: unpaidRes } = useQuery({ queryKey: ['dashboard-unpaid'], ... });
const { data: expiringRes } = useQuery({ queryKey: ['dashboard-expiring'], ... });
const { data: revenueRes } = useQuery({ queryKey: ['dashboard-revenue'], ... });
const { data: occupancyRes } = useQuery({ queryKey: ['dashboard-occupancy'], ... });
```

Five separate HTTP requests are fired on every dashboard load. Combined with the N+1 chart queries (§2.1), this is the most expensive page in the application.

**Debt:** Consolidate into a single `/api/dashboard` endpoint that returns all dashboard data in one response, or at minimum combine the two chart endpoints.

### 3.4 `authMiddleware` Does Not Validate Token Expiry Against the Database

The refresh token expiry is checked against the database (`stored.expiresAt < new Date()`), but the access token is only validated by JWT signature and expiry claim. There is no mechanism to invalidate access tokens before their 15-minute expiry (e.g., after a password change or forced logout from another device).

**Debt:** For a single-user personal app this is acceptable. For multi-user deployment, consider a token blocklist or reducing access token lifetime further.

### 3.5 No Backend Unit Tests for Business Logic

The only backend tests are the VietQR unit tests in `pdfController.test.js` (run with raw `node`, no test framework). The core billing logic in `invoiceService.js` (`calculateTotal`) has no automated tests. Edge cases like:
- `periodStart === periodEnd` (1-day period)
- `electricityNow < electricityPrev` (meter reset)
- `baseRent = 0`
- Leap year February

...are untested.

**Debt:** Add Jest or Vitest to the backend. Write unit tests for `calculateTotal` covering boundary conditions.

### 3.6 `ROOM_STATUS_COLORS` in `utils.js` Uses Old Color Classes

```js
// frontend/src/lib/utils.js — stale color classes
export const ROOM_STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-800',
  OCCUPIED: 'bg-blue-100 text-blue-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
};
```

The Botanic Floria redesign (Patch 1.4.4) introduced new color tokens (`#2E7D32` sage green, `#E65100` terracotta), but `ROOM_STATUS_COLORS` still uses the old Tailwind utility classes. The pages use inline `STATUS_BADGES` objects instead, making `ROOM_STATUS_COLORS` dead code.

**Debt:** Remove `ROOM_STATUS_COLORS` from `utils.js` or update it to match the current design system.

### 3.7 `WakeUpBanner` Has a Race Condition

```js
// WakeUpBanner.jsx
useEffect(() => {
  const timer = setTimeout(() => setWaking(true), 10000);
  API.get('/health').then(() => {
    clearTimeout(timer);
    setWaking(false);
  }).catch(() => {});
  return () => clearTimeout(timer);
}, []);
```

If the health check succeeds in under 10 seconds, the banner never shows — correct. But if the health check **fails** (network error, 500 response), the `.catch(() => {})` silently swallows the error and the timer still fires, showing the "waking up" banner indefinitely. The banner has no dismiss mechanism and no timeout to hide itself after the server is confirmed unreachable.

**Debt:** Handle the error case: either hide the banner after a maximum wait time, or show a different "server unreachable" message.

---

## 4. Scalability Risks

### 4.1 Neon Serverless Cold Start Latency

The app is deployed on Render (free tier) with a Neon serverless PostgreSQL database. Both services have cold start delays:
- **Render free tier**: Spins down after 15 minutes of inactivity; cold start takes 30–60 seconds.
- **Neon serverless**: Connection establishment adds 100–500ms on cold connections.

The `WakeUpBanner` mitigates the Render cold start UX issue, but the combination of both cold starts means the first request after inactivity can take 60+ seconds. The `authMiddleware` DB lookup on every request compounds this.

**Risk:** Acceptable for a personal app with a single user. Unacceptable for any multi-user or commercial deployment.

### 4.2 No Connection Pooling

```js
// config/db.js — direct PrismaClient, no pooler
const prisma = global.prisma || new PrismaClient();
```

Neon serverless has a connection limit (typically 10–20 on free tier). The current setup creates a direct connection per server process. On Render, this is a single process, so it's fine. But if the app were scaled horizontally (multiple instances), each instance would hold its own connection pool, quickly exhausting Neon's limit.

**Risk:** Low for current single-instance deployment. High if scaled. **Fix:** Use Neon's connection pooler (PgBouncer) via the `?pgbouncer=true` connection string parameter, or use `@prisma/adapter-neon` with the Neon serverless driver.

### 4.3 PDF Generation is Synchronous and Blocking

```js
// pdfController.js — synchronous PDF generation in the request handler
const pdfBytes = await pdfDoc.save();
res.send(Buffer.from(pdfBytes));
```

PDF generation with `pdf-lib` is CPU-bound. For a single user generating one PDF at a time, this is fine. If multiple users request PDFs simultaneously, the Node.js event loop will be blocked during the synchronous portions of PDF rendering, degrading response times for all concurrent requests.

**Risk:** Low for current single-user scale. Medium for multi-user deployment. **Fix:** Move PDF generation to a background job queue (e.g., BullMQ) or a separate worker process.

### 4.4 Cloudinary File Storage Has No Size or Count Limits

The `uploadToCloudinary` function accepts any file up to 5MB (enforced by multer). There is no limit on the number of files per tenant or total storage per user. A user could upload thousands of files, exhausting the Cloudinary free tier (25GB) without any warning.

**Risk:** Low for current scale (5–20 rooms). Medium over time. **Fix:** Add a per-tenant file count limit (e.g., max 10 files) enforced in `uploadFile` controller.

### 4.5 Invoice Table Will Grow Unboundedly

The `Invoice` table has no archival or cleanup strategy. At 20 rooms × 12 months × 5 years = 1,200 rows, this is trivial for PostgreSQL. However, the `getInvoices` endpoint returns all matching invoices without pagination, and the `exportInvoicesCsv` endpoint returns all invoices for a given year in a single response.

**Risk:** Low for current scale. The CSV export could become slow/memory-intensive after several years of data.

---

## 5. Refactoring Recommendations

Prioritized by impact-to-effort ratio.

### Priority 1 — Fix Immediately (Correctness Issues)

#### R1: Fix Cloudinary Orphaned Files on Deletion

Store `public_id` from Cloudinary upload result in the `TenantFile` table and call `deleteFromCloudinary` on file deletion.

```js
// tenantController.js — add to TenantFile schema
const result = await uploadToCloudinary(req.file.buffer, 'houserenting/tenants');
const file = await prisma.tenantFile.create({
  data: {
    tenantId: tenant.id,
    label: label || req.file.originalname,
    url: result.secure_url,
    publicId: result.public_id, // ← add this field
  },
});

// deleteFile — add Cloudinary cleanup
await deleteFromCloudinary(file.publicId);
await prisma.tenantFile.delete({ where: { id: file.id } });
```

**Schema change required:** Add `publicId String?` to `TenantFile` model in `schema.prisma`.

#### R2: Make `bulkCreateInvoices` Atomic

```js
// invoiceController.js — wrap in transaction
const invoicesToCreate = []; // build array first
// ... (validation loop)
await prisma.$transaction(
  invoicesToCreate.map(data => prisma.invoice.create({ data }))
);
```

Or use `createMany` with `skipDuplicates: true` for better performance.

#### R3: Remove Runtime DDL from `index.js`

Delete the `ensureDatabaseSchema` function and its call from `index.js`. Verify the `paymentInfo` migration is included in the deployment pipeline.

### Priority 2 — High Value, Low Risk

#### R4: Eliminate N+1 in Dashboard Chart Queries

Replace the 6-iteration loops with a single aggregation query:

```js
// dashboardController.js — single query for 6-month revenue
const revenueData = await prisma.$queryRaw`
  SELECT month, year, SUM("paidAmount") as revenue
  FROM "Invoice"
  WHERE "userId" = ${userId}
    AND paid = true
    AND (year * 100 + month) >= ${sixMonthsAgo}
  GROUP BY year, month
  ORDER BY year, month
`;
```

#### R5: Add Zod Validation Middleware to Backend

Create a reusable `validate(schema)` middleware and apply it to all routes:

```js
// middlewares/validate.js
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      code: 'VALIDATION_ERROR',
      errors: result.error.flatten(),
    });
  }
  req.body = result.data;
  next();
};
```

#### R6: Embed User Data in JWT to Eliminate Auth DB Lookup

```js
// authController.js
const genAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '15m' });

// authMiddleware.js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
// No DB lookup needed
next();
```

### Priority 3 — Structural Improvements

#### R7: Split `pdfController.js` into Focused Modules

```
backend/src/
  controllers/
    pdfController.js        ← thin controller, delegates to services
  services/
    pdfService.js           ← PDF layout and rendering
    vietQrService.js        ← parsePaymentInfo, buildVietQRString, bankBinMap
  utils/
    crc16.js                ← CRC-16/CCITT algorithm
```

#### R8: Add Unit Tests for `invoiceService.js`

Install Jest or Vitest in the backend and add tests for `calculateTotal`:

```js
// invoiceService.test.js
describe('calculateTotal', () => {
  it('calculates full month correctly', () => { ... });
  it('handles pro-rata for partial month', () => { ... });
  it('handles meter reset (now < prev)', () => { ... });
  it('handles leap year February', () => { ... });
  it('handles zero base rent', () => { ... });
});
```

#### R9: Add Pagination to Invoice List Endpoint

```js
// invoiceController.js
const { page = 1, limit = 50, ...filters } = req.query;
const invoices = await prisma.invoice.findMany({
  where: { ... },
  skip: (Number(page) - 1) * Number(limit),
  take: Number(limit),
  ...
});
const total = await prisma.invoice.count({ where: { ... } });
res.json({ success: true, data: invoices, meta: { total, page, limit } });
```

#### R10: Gate Demo Credentials Behind `import.meta.env.DEV`

```jsx
// LoginPage.jsx
{import.meta.env.DEV && (
  <div className="mt-8 p-5 bg-[#FCFAF6] ...">
    <p>Email: <code>admin@test.com</code></p>
    <p>Mật khẩu: <code>password123</code></p>
  </div>
)}
```

#### R11: Fix `WakeUpBanner` Error Handling

```js
// WakeUpBanner.jsx
useEffect(() => {
  const timer = setTimeout(() => setWaking(true), 10000);
  const hideTimer = setTimeout(() => setWaking(false), 60000); // max 60s
  API.get('/health')
    .then(() => { clearTimeout(timer); clearTimeout(hideTimer); setWaking(false); })
    .catch(() => { clearTimeout(timer); setWaking(true); });
  return () => { clearTimeout(timer); clearTimeout(hideTimer); };
}, []);
```

#### R12: Remove Dead Code `ROOM_STATUS_COLORS`

Delete `ROOM_STATUS_COLORS` from `frontend/src/lib/utils.js` since it is unused in the current codebase (all pages define their own inline badge styles).

---

## 6. Risk Summary Matrix

| # | Issue | Severity | Effort to Fix | Priority |
|---|-------|----------|---------------|----------|
| 2.2 | `bulkCreateInvoices` not atomic | High | Low | P1 |
| 2.7 | Cloudinary files not deleted on removal | High | Low | P1 |
| 2.6 | Runtime DDL migration in `index.js` | Medium | Low | P1 |
| 2.1 | N+1 queries in dashboard charts | High | Medium | P2 |
| 2.5 | No systematic backend input validation | Medium | Medium | P2 |
| 2.3 | DB lookup on every auth middleware call | Medium | Low | P2 |
| 3.2 | `pdfController.js` god object | Medium | Medium | P3 |
| 3.5 | No unit tests for billing logic | Medium | Medium | P3 |
| 4.2 | No connection pooling | Low (now) | Low | P3 |
| 3.1 | No pagination on invoice list | Low (now) | Low | P3 |
| 2.8 | Demo credentials in production UI | Low | Trivial | P3 |
| 3.7 | `WakeUpBanner` swallows errors | Low | Trivial | P3 |
| 3.6 | Dead code `ROOM_STATUS_COLORS` | Low | Trivial | P3 |
| 4.3 | Synchronous PDF generation | Low (now) | High | Backlog |
| 4.4 | No Cloudinary storage limits | Low (now) | Low | Backlog |

---

## Overall Assessment

This is a **well-structured, production-quality personal application** for its stated scope (5–20 rooms, single landlord). The architecture choices are appropriate for the constraints: free-tier cloud hosting, zero operational cost, and a single developer maintaining the codebase.

The strongest aspects are the authentication implementation, ownership isolation, consistent API design, and the E2E test coverage of the critical business path. The VietQR implementation is notably thorough, with proper EMVCo compliance and a pragmatic two-tier fallback strategy.

The most pressing issues to address are the non-atomic bulk invoice creation (data integrity risk), the orphaned Cloudinary files (storage leak), and the N+1 dashboard queries (performance). All three are fixable in under a day of work.

The codebase is in good shape for its current scale and would require moderate refactoring before being suitable for multi-tenant or commercial deployment.
