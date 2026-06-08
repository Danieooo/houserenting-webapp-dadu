# Implementation Plan: Architecture Refactoring

## Overview

Triển khai 12 khuyến nghị tái cấu trúc (R1–R12) theo 4 phase: P1 sửa lỗi tính đúng đắn, P2 cải thiện hiệu năng/validation, P3 cải tiến cấu trúc code, P4 frontend trivial. Mỗi task được thiết kế để deploy độc lập và backward-compatible.

## Tasks

- [ ] 1. Phase 1 — Sửa ngay (Lỗi tính đúng đắn)

  - [-] 1.1 Remove runtime DDL from `index.js` (R3)
    - Xóa hoàn toàn hàm `ensureDatabaseSchema()` và lời gọi của nó khỏi `backend/src/index.js`
    - Thay thế `ensureDatabaseSchema().then(() => { app.listen(...) })` bằng `app.listen(PORT, ...)` trực tiếp
    - Xác nhận migration `20260428000000_add_payment_info` đã chứa `ALTER TABLE "Settings" ADD COLUMN "paymentInfo" TEXT`
    - _Requirements: 3.1, 3.2, 3.3_

  - [~] 1.2 Add `publicId` field to Prisma schema and create migration (R1 — schema)
    - Thêm `publicId String?` vào model `TenantFile` trong `backend/prisma/schema.prisma`
    - Chạy `npx prisma migrate dev --name add_public_id_to_tenant_file` để tạo migration mới
    - Xác nhận migration SQL chứa `ALTER TABLE "TenantFile" ADD COLUMN "publicId" TEXT`
    - _Requirements: 1.4_

  - [~] 1.3 Fix `uploadFile` to store Cloudinary `publicId` (R1 — upload)
    - Sửa `exports.uploadFile` trong `backend/src/controllers/tenantController.js`
    - Thêm `publicId: result.public_id` vào object `data` của `prisma.tenantFile.create()`
    - _Requirements: 1.1_

  - [~] 1.4 Fix `deleteFile` to cleanup Cloudinary before DB delete (R1 — delete)
    - Sửa `exports.deleteFile` trong `backend/src/controllers/tenantController.js`
    - Nếu `file.publicId` tồn tại: gọi `await deleteFromCloudinary(file.publicId)` trước khi xóa DB record (throw on failure → abort deletion)
    - Nếu `file.publicId` là `null`/rỗng: log warning `[Cloudinary] TenantFile ${file.id} has no publicId, skipping cloud delete` và tiếp tục xóa DB record
    - _Requirements: 1.2, 1.3_

  - [~] 1.5 Fix `deleteTenant` to cleanup all Cloudinary files before cascade delete (R1 — cascade)
    - Sửa `exports.deleteTenant` trong `backend/src/controllers/tenantController.js`
    - Trước transaction: fetch tất cả `TenantFile` của tenant, loop gọi `deleteFromCloudinary(file.publicId)` cho mỗi file có publicId
    - Giữ nguyên transaction `$transaction([deleteMany files, deleteMany invoices, delete tenant])`
    - _Requirements: 1.5_

  - [~] 1.6 Refactor `bulkCreateInvoices` to use atomic transaction (R2)
    - Sửa `exports.bulkCreateInvoices` trong `backend/src/controllers/invoiceController.js`
    - Tách logic thành 2 phase: (1) Pre-compute invoice data list ngoài transaction, (2) Wrap tất cả `prisma.invoice.create()` trong `prisma.$transaction(invoiceDataList.map(...))`
    - Giữ nguyên logic skip (existing invoices) và readings lookup ngoài transaction
    - Trả về error response với thông tin `{ roomsAttempted, reason }` khi transaction fail
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [~] 1.7 Write property test for bulk invoice atomicity (Property 1)
    - **Property 1: Atomicity Invariant for Bulk Invoice Creation**
    - Tạo file `backend/src/controllers/invoiceController.test.js`
    - Mock Prisma transaction để simulate failure tại bước thứ k
    - Verify: số lượng invoice trong DB sau failed call === số lượng trước call
    - **Validates: Requirements 2.1, 2.2, 2.4**

- [~] 2. Checkpoint — Phase 1 complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Phase 2 — Giá trị cao, rủi ro thấp

  - [~] 3.1 Embed user info into JWT payload (R6 — authController)
    - Sửa `genAccessToken` trong `backend/src/controllers/authController.js`: thay `jwt.sign({ id }, ...)` bằng `jwt.sign({ id: user.id, email: user.email, name: user.name }, ...)`
    - Cập nhật tất cả call sites: `login` → `genAccessToken(user)`, `register` → `genAccessToken(user)`
    - Sửa `refresh` endpoint: fetch user từ DB bằng `decoded.id` để lấy `email`/`name` trước khi gọi `genAccessToken(user)`
    - _Requirements: 6.1, 6.5_

  - [~] 3.2 Remove DB lookup from `authMiddleware` (R6 — middleware)
    - Sửa `backend/src/middlewares/authMiddleware.js`
    - Xóa `const prisma = require('../config/db')` và `prisma.user.findUnique()` call
    - Gán `req.user = { id: decoded.id, email: decoded.email, name: decoded.name }` trực tiếp từ JWT payload
    - Thêm guard: nếu `!decoded.email || !decoded.name` → return 401 (reject old tokens)
    - _Requirements: 6.2, 6.3, 6.4_

  - [~] 3.3 Write property test for JWT round-trip (Property 6)
    - **Property 6: JWT User Data Round-Trip**
    - Tạo file `backend/src/middlewares/authMiddleware.test.js`
    - Dùng `fast-check` generate random `{ id, email, name }`, encode với `genAccessToken`, decode với `jwt.verify`, assert equality
    - **Validates: Requirements 6.1, 6.2**

  - [~] 3.4 Create Zod validation middleware (R5 — middleware)
    - Tạo file `backend/src/middlewares/validate.js` với hàm `validate(schema)` trả về Express middleware
    - Khi invalid: return 400 `{ success: false, message: 'Dữ liệu không hợp lệ', code: 'VALIDATION_ERROR', errors: result.error.flatten() }`
    - Khi valid: gán `req.body = result.data` rồi gọi `next()`
    - _Requirements: 5.1, 5.2, 5.3_

  - [~] 3.5 Create Zod schemas for all endpoints (R5 — schemas)
    - Tạo `backend/src/schemas/roomSchema.js`: `createRoomSchema`, `updateRoomSchema` (baseRent int positive, electricPrice int positive, waterPrice int positive, garbageFee int nonnegative)
    - Tạo `backend/src/schemas/tenantSchema.js`: `createTenantSchema` (name, phone, roomId required)
    - Tạo `backend/src/schemas/invoiceSchema.js`: `createInvoiceSchema` (refine electricityNow >= electricityPrev, waterNow >= waterPrev), `bulkCreateInvoiceSchema`
    - Tạo `backend/src/schemas/settingsSchema.js`: `updateSettingsSchema` (webhookUrl validate https URL)
    - _Requirements: 5.4, 5.5, 5.6, 5.7_

  - [~] 3.6 Wire validation middleware into route files (R5 — wiring)
    - Sửa `backend/src/routes/roomRoutes.js`: thêm `validate(createRoomSchema)` cho POST, `validate(updateRoomSchema)` cho PUT
    - Sửa `backend/src/routes/tenantRoutes.js`: thêm `validate(createTenantSchema)` cho POST
    - Sửa `backend/src/routes/invoiceRoutes.js`: thêm `validate(createInvoiceSchema)` cho POST, `validate(bulkCreateInvoiceSchema)` cho POST /bulk
    - Sửa `backend/src/routes/settingsRoutes.js`: thêm `validate(updateSettingsSchema)` cho PUT
    - _Requirements: 5.4_

  - [~] 3.7 Write property tests for validation middleware (Property 4 & 5)
    - **Property 4: Validation Middleware Rejects All Invalid Inputs**
    - **Property 5: Validation Middleware Passes All Valid Inputs**
    - Tạo file `backend/src/middlewares/validate.test.js`
    - Dùng `fast-check` generate invalid bodies (missing fields, wrong types, electricityNow < electricityPrev) → assert 400
    - Dùng `fast-check` generate valid bodies → assert `next()` called with parsed data
    - **Validates: Requirements 5.2, 5.3, 5.5, 5.6, 5.7**

  - [~] 3.8 Eliminate N+1 queries in `getRevenueChart` (R4 — revenue)
    - Sửa `exports.getRevenueChart` trong `backend/src/controllers/dashboardController.js`
    - Thay vòng lặp 6 lần `prisma.invoice.findMany()` bằng một `prisma.$queryRaw` GROUP BY month, year
    - Fill missing months với revenue: 0
    - Giữ nguyên output shape: `{ month: 'M/YYYY', revenue: number }`
    - _Requirements: 4.1, 4.3, 4.5_

  - [~] 3.9 Eliminate N+1 queries in `getOccupancyChart` (R4 — occupancy)
    - Sửa `exports.getOccupancyChart` trong `backend/src/controllers/dashboardController.js`
    - Thay vòng lặp 6 lần bằng: 1 `prisma.room.count()` + 1 `prisma.$queryRaw` GROUP BY month, year với COUNT(DISTINCT roomId)
    - Giữ nguyên output shape: `{ month: 'M/YYYY', rate: number, occupied: number, total: number }`
    - _Requirements: 4.2, 4.4, 4.5_

  - [~] 3.10 Write property tests for dashboard chart equivalence (Property 2 & 3)
    - **Property 2: Revenue Chart Model Equivalence**
    - **Property 3: Occupancy Chart Model Equivalence**
    - Tạo file `backend/src/controllers/dashboardController.test.js`
    - Mock Prisma để cung cấp random invoice data, so sánh output của implementation mới vs logic vòng lặp cũ
    - **Validates: Requirements 4.1, 4.2, 4.5**

- [~] 4. Checkpoint — Phase 2 complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Phase 3 — Cải tiến cấu trúc

  - [~] 5.1 Extract CRC-16 utility module (R7 — crc16)
    - Tạo file `backend/src/utils/crc16.js`
    - Extract thuật toán CRC-16/CCITT (polynomial 0x1021, init 0xFFFF) từ `buildVietQRString` trong `pdfController.js`
    - Export `{ crc16 }` function nhận string, trả về 4-char uppercase hex
    - _Requirements: 7.2_

  - [~] 5.2 Extract VietQR service module (R7 — vietQrService)
    - Tạo file `backend/src/services/vietQrService.js`
    - Move `bankBinMap`, `parsePaymentInfo()`, `buildVietQRString()` từ `pdfController.js`
    - Import `{ crc16 }` từ `../utils/crc16.js` thay vì inline CRC logic
    - Export `{ bankBinMap, parsePaymentInfo, buildVietQRString }`
    - _Requirements: 7.1, 7.6_

  - [~] 5.3 Extract PDF service module (R7 — pdfService)
    - Tạo file `backend/src/services/pdfService.js`
    - Move toàn bộ logic PDF generation (font discovery, drawText, drawRow, QR embedding, layout) từ `pdfController.js`
    - Import `{ parsePaymentInfo, buildVietQRString }` từ `./vietQrService`
    - Export `{ generateInvoicePdf }` nhận `(invoice, settings)` trả về `Promise<Uint8Array>`
    - _Requirements: 7.3_

  - [~] 5.4 Slim down `pdfController.js` to thin handler (R7 — controller)
    - Rewrite `backend/src/controllers/pdfController.js` thành thin controller
    - Chỉ giữ: DB query invoice → gọi `generateInvoicePdf(invoice, settings)` → send PDF response
    - Re-export `parsePaymentInfo` và `buildVietQRString` từ `vietQrService` để backward-compatible với `pdfController.test.js`
    - _Requirements: 7.4, 7.5, 7.6_

  - [-] 5.5 Set up Vitest test infrastructure (R8 — setup)
    - Cài `vitest` và `fast-check` vào `backend/package.json` devDependencies
    - Thêm script `"test": "vitest run"` vào package.json
    - Xác nhận `npm test` chạy được trong thư mục `backend/`
    - _Requirements: 8.1, 8.9_

  - [~] 5.6 Write unit tests for `calculateTotal` (R8 — tests)
    - Tạo file `backend/src/services/invoiceService.test.js`
    - Viết 8+ test cases: tháng đầy đủ 30 ngày, tháng 31 ngày, pro-rata thuê từ ngày 15, pro-rata 1 ngày, đồng hồ reset, tháng 2 nhuận 29 ngày, baseRent = 0, otherFees thập phân
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [~] 5.7 Write property tests for `calculateTotal` (Property 7 & 8)
    - **Property 7: calculateTotal Non-Negative Invariant**
    - **Property 8: calculateTotal Metamorphic — Full Month >= Partial Month**
    - Thêm vào `backend/src/services/invoiceService.test.js`
    - Dùng `fast-check` generate valid inputs, assert result >= 0
    - Assert full-month result >= partial-month result với cùng parameters
    - **Validates: Requirements 8.3, 8.4, 8.5, 8.6, 8.7, 8.8**

  - [~] 5.8 Add pagination to `getInvoices` endpoint (R9)
    - Sửa `exports.getInvoices` trong `backend/src/controllers/invoiceController.js`
    - Parse `page` (default 1) và `limit` (default 50, max 200) từ query params
    - Dùng `Promise.all([prisma.invoice.findMany({ skip, take }), prisma.invoice.count({ where })])` cho parallel query
    - Trả về `{ success: true, data: invoices, meta: { total, page, limit, totalPages } }`
    - Handle edge cases: NaN → defaults, page > totalPages → empty data, no records → meta with total: 0
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [~] 5.9 Write property test for pagination partition invariant (Property 9)
    - **Property 9: Pagination Partition Invariant**
    - Thêm vào `backend/src/controllers/invoiceController.test.js`
    - Dùng `fast-check` generate N invoices và limit L, verify union of all pages === N items, no duplicates
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [~] 6. Checkpoint — Phase 3 complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Phase 4 — Frontend (Trivial)

  - [~] 7.1 Gate demo credentials behind `import.meta.env.DEV` (R10)
    - Sửa `frontend/src/pages/LoginPage.jsx`
    - Bọc khối `<div className="mt-8 p-5 bg-[#FCFAF6]...">` (demo credentials) trong `{import.meta.env.DEV && (...)}`
    - _Requirements: 10.1, 10.2, 10.3_

  - [~] 7.2 Fix WakeUpBanner timer and error handling (R11)
    - Sửa `frontend/src/components/WakeUpBanner.jsx`
    - Thêm `hideTimer = setTimeout(() => setWaking(false), 60000)` — auto-hide sau 60s
    - Sửa `.catch()`: thay `() => {}` bằng `() => { clearTimeout(showTimer); setWaking(true); }` — hiển thị banner khi error
    - Khi health check success: clear cả `showTimer` và `hideTimer`
    - Cleanup function: clear cả `showTimer` và `hideTimer` khi unmount
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [~] 7.3 Remove dead code `ROOM_STATUS_COLORS` (R12)
    - Xóa export `ROOM_STATUS_COLORS` khỏi `frontend/src/lib/utils.js`
    - Xác nhận không có file nào trong `frontend/src/` import `ROOM_STATUS_COLORS`
    - _Requirements: 12.1, 12.2, 12.3_

- [~] 8. Final checkpoint — All phases complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each phase
- Property tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- The design uses JavaScript (Node.js + React) — no language selection needed
- All API response shapes are preserved (backward-compatible) except R9 which adds `meta` field
- R7 re-exports `parsePaymentInfo` and `buildVietQRString` from pdfController for backward compatibility with existing `pdfController.test.js`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "5.5"] },
    { "id": 1, "tasks": ["1.2", "3.1"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5", "3.2"] },
    { "id": 3, "tasks": ["1.6", "3.3", "3.4"] },
    { "id": 4, "tasks": ["1.7", "3.5"] },
    { "id": 5, "tasks": ["3.6", "3.8", "3.9"] },
    { "id": 6, "tasks": ["3.7", "3.10", "5.1"] },
    { "id": 7, "tasks": ["5.2"] },
    { "id": 8, "tasks": ["5.3"] },
    { "id": 9, "tasks": ["5.4", "5.6"] },
    { "id": 10, "tasks": ["5.7", "5.8"] },
    { "id": 11, "tasks": ["5.9", "7.1", "7.2", "7.3"] }
  ]
}
```
