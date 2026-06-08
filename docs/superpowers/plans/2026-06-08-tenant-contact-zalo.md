# Tenant Contact Flexibility & Zalo Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow tenants to be created without a phone number, store a separate `zaloContact`, and make the invoice notification modal degrade gracefully when only Zalo contact metadata exists.

**Architecture:** Extend the tenant data contract with a new optional `zaloContact` field and make `phone` default to an empty string instead of being required. Keep the current clipboard-first notification flow, but branch the UI so Zalo and SMS actions only open deep links when `phone` exists, while `zaloContact` remains a landlord-facing discovery hint.

**Tech Stack:** Prisma, Express, React, React Hook Form, Zod, TanStack Query, Playwright, Node `assert`

---

## File Map

- Create: `backend/prisma/migrations/20260608_make_tenant_phone_optional_add_zalo_contact/migration.sql`
- Create: `backend/src/utils/tenantContact.js`
- Create: `backend/src/utils/tenantContact.test.js`
- Create: `frontend/e2e/tenant-contact-flexibility.spec.js`
- Create: `frontend/e2e/notification-zalo-fallback.spec.js`
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/prisma/seed.js`
- Modify: `backend/package.json`
- Modify: `backend/src/controllers/tenantController.js`
- Modify: `frontend/src/pages/TenantsPage.jsx`
- Modify: `frontend/src/pages/TenantDetailPage.jsx`
- Modify: `frontend/src/pages/RoomDetailPage.jsx`
- Modify: `frontend/src/pages/InvoiceDetailPage.jsx`
- Modify: `frontend/e2e/happy-path.spec.js`
- Modify: `frontend/e2e/notification-flow.spec.js`
- Modify: `AGENTS.md`
- Modify: `CHANGELOG.md`

---

### Task 1: Backend Tenant Contact Contract

**Files:**
- Create: `backend/prisma/migrations/20260608_make_tenant_phone_optional_add_zalo_contact/migration.sql`
- Create: `backend/src/utils/tenantContact.js`
- Create: `backend/src/utils/tenantContact.test.js`
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/prisma/seed.js`
- Modify: `backend/package.json`
- Modify: `backend/src/controllers/tenantController.js`

- [ ] **Step 1: Write the failing backend unit test for contact normalization**

```js
// backend/src/utils/tenantContact.test.js
const assert = require('assert');
const {
  normalizeOptionalContact,
  buildTenantContactPayload,
} = require('./tenantContact');

assert.strictEqual(normalizeOptionalContact(undefined), '');
assert.strictEqual(normalizeOptionalContact(null), '');
assert.strictEqual(normalizeOptionalContact('  0987654321  '), '0987654321');
assert.strictEqual(normalizeOptionalContact('  zalo me/tenant-a  '), 'zalo me/tenant-a');

assert.deepStrictEqual(
  buildTenantContactPayload({
    phone: '  ',
    zaloContact: ' zalo-user-01 ',
  }),
  {
    phone: '',
    zaloContact: 'zalo-user-01',
  }
);

console.log('tenantContact utils: all assertions passed');
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
cd backend
node src/utils/tenantContact.test.js
```

Expected: FAIL with `Cannot find module './tenantContact'` or missing export errors.

- [ ] **Step 3: Implement the contact normalization helper**

```js
// backend/src/utils/tenantContact.js
function normalizeOptionalContact(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function buildTenantContactPayload({ phone, zaloContact }) {
  return {
    phone: normalizeOptionalContact(phone),
    zaloContact: normalizeOptionalContact(zaloContact),
  };
}

module.exports = {
  normalizeOptionalContact,
  buildTenantContactPayload,
};
```

- [ ] **Step 4: Run the helper test to verify it passes**

Run:

```bash
cd backend
node src/utils/tenantContact.test.js
```

Expected: PASS with `tenantContact utils: all assertions passed`.

- [ ] **Step 5: Update Prisma schema, migration, seed data, and tenant controller**

```prisma
// backend/prisma/schema.prisma
model Tenant {
  id          Int          @id @default(autoincrement())
  name        String
  phone       String       @default("")
  zaloContact String       @default("")
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
```

```sql
-- backend/prisma/migrations/20260608_make_tenant_phone_optional_add_zalo_contact/migration.sql
ALTER TABLE "Tenant"
ALTER COLUMN "phone" SET DEFAULT '';

UPDATE "Tenant"
SET "phone" = ''
WHERE "phone" IS NULL;

ALTER TABLE "Tenant"
ADD COLUMN "zaloContact" TEXT NOT NULL DEFAULT '';
```

```js
// backend/src/controllers/tenantController.js
const { buildTenantContactPayload } = require('../utils/tenantContact');

exports.createTenant = async (req, res, next) => {
  try {
    const { name, phone, zaloContact, idCard, roomId, moveInDate, moveOutDate, deposit } = req.body;
    if (!name || !roomId || !moveInDate) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc', code: 'VALIDATION_ERROR' });
    }

    const contactPayload = buildTenantContactPayload({ phone, zaloContact });

    const tenant = await prisma.tenant.create({
      data: {
        name,
        ...contactPayload,
        idCard: idCard || null,
        roomId: Number(roomId),
        moveInDate: new Date(moveInDate),
        moveOutDate: moveOutDate ? new Date(moveOutDate) : null,
        deposit: deposit ? Number(deposit) : 0,
      },
    });
```

```js
// backend/src/controllers/tenantController.js
exports.updateTenant = async (req, res, next) => {
  try {
    const { name, phone, zaloContact, idCard, moveInDate, moveOutDate, deposit } = req.body;
    const contactPayload = buildTenantContactPayload({ phone, zaloContact });

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone: contactPayload.phone }),
        ...(zaloContact !== undefined && { zaloContact: contactPayload.zaloContact }),
        idCard: idCard !== undefined ? idCard : undefined,
        ...(moveInDate && { moveInDate: new Date(moveInDate) }),
        moveOutDate: moveOutDate !== undefined ? (moveOutDate ? new Date(moveOutDate) : null) : undefined,
        ...(deposit !== undefined && { deposit: Number(deposit) }),
      },
    });
```

```js
// backend/prisma/seed.js
phone: '0901234567',
zaloContact: 'zalo-admin-seed',
```

```json
// backend/package.json
{
  "scripts": {
    "test": "node src/controllers/pdfController.test.js && node src/utils/tenantContact.test.js"
  }
}
```

- [ ] **Step 6: Validate Prisma and backend tests**

Run:

```bash
cd backend
npx prisma validate
npm test
```

Expected:
- `The schema at schema.prisma is valid`
- `tenantContact utils: all assertions passed`
- existing QR tests still PASS

- [ ] **Step 7: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/20260608_make_tenant_phone_optional_add_zalo_contact/migration.sql backend/prisma/seed.js backend/package.json backend/src/controllers/tenantController.js backend/src/utils/tenantContact.js backend/src/utils/tenantContact.test.js
git commit -m "feat: support optional tenant phone and zalo contact"
```

---

### Task 2: Tenant Form, List, and Detail UI

**Files:**
- Create: `frontend/e2e/tenant-contact-flexibility.spec.js`
- Modify: `frontend/src/pages/TenantsPage.jsx`
- Modify: `frontend/src/pages/TenantDetailPage.jsx`
- Modify: `frontend/src/pages/RoomDetailPage.jsx`
- Modify: `frontend/e2e/happy-path.spec.js`

- [ ] **Step 1: Write the failing E2E test for tenant creation without phone**

```js
// frontend/e2e/tenant-contact-flexibility.spec.js
import { test, expect } from '@playwright/test';

test('allows creating a tenant with empty phone and saved zaloContact', async ({ page }) => {
  const uniqueId = Math.floor(Math.random() * 1000000);
  const roomName = `Room Zalo ${uniqueId}`;
  const tenantName = `Tenant Zalo ${uniqueId}`;

  page.on('dialog', async (dialog) => dialog.accept());

  await page.goto('/login');
  await page.fill('[data-testid="login-email"]', 'admin@test.com');
  await page.fill('[data-testid="login-password"]', 'password123');
  await page.click('[data-testid="login-submit"]');

  await page.click('aside a[href="/rooms"]');
  await page.click('[data-testid="add-room-btn"]');
  await page.fill('[data-testid="room-form-name"]', roomName);
  await page.fill('[data-testid="room-form-baseRent"]', '2000000');
  await page.fill('[data-testid="room-form-electricPrice"]', '3500');
  await page.fill('[data-testid="room-form-waterPrice"]', '15000');
  await page.fill('[data-testid="room-form-garbageFee"]', '20000');
  await page.click('[data-testid="room-form-submit"]');

  await page.click('aside a[href="/tenants"]');
  await page.click('[data-testid="add-tenant-btn"]');
  await page.fill('[data-testid="tenant-form-name"]', tenantName);
  await page.fill('[data-testid="tenant-form-zaloContact"]', 'zalo-user-flexible');
  await page.selectOption('[data-testid="tenant-form-roomId"]', { label: `${roomName} (Trống)` });
  await page.fill('[data-testid="tenant-form-moveInDate"]', '2026-06-01');
  await page.click('[data-testid="tenant-form-submit"]');

  const tenantCard = page.locator(`[data-testid="tenant-card-${tenantName.replace(/\\s+/g, '-')}"]`);
  await expect(tenantCard).toBeVisible();
  await expect(tenantCard).toContainText('zalo-user-flexible');
});
```

- [ ] **Step 2: Run the E2E test to verify it fails**

Run:

```bash
cd frontend
npm run test:e2e -- tenant-contact-flexibility.spec.js
```

Expected: FAIL because `tenant-form-zaloContact` does not exist and `phone` is currently required.

- [ ] **Step 3: Implement the tenant form and display updates**

```js
// frontend/src/pages/TenantsPage.jsx
const schema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  phone: z.string().trim().refine((value) => value === '' || value.length >= 9, 'Số điện thoại không hợp lệ'),
  zaloContact: z.string().trim().max(120, 'Thông tin Zalo quá dài').optional(),
  idCard: z.string().optional(),
  roomId: z.string().min(1, 'Vui lòng chọn phòng'),
  moveInDate: z.string().min(1, 'Vui lòng chọn ngày vào ở'),
  moveOutDate: z.string().optional(),
  deposit: z.string().optional(),
});
```

```jsx
// frontend/src/pages/TenantsPage.jsx
{[
  { label: 'Họ tên *', name: 'name', placeholder: 'Nguyễn Văn A' },
  { label: 'Số điện thoại', name: 'phone', placeholder: '0901234567' },
  { label: 'Liên hệ Zalo', name: 'zaloContact', placeholder: 'Số Zalo, username, link profile hoặc ghi chú' },
  { label: 'CCCD/CMND', name: 'idCard', placeholder: '012345678901' },
].map(({ label, name, placeholder }) => (
```

```jsx
// frontend/src/pages/TenantsPage.jsx
<div className="flex items-center gap-2 text-slate-500 font-medium">
  <Phone size={14} className="text-slate-400" />
  <span>{t.phone || 'Chưa lưu số điện thoại'}</span>
</div>
<div className="flex items-start gap-2 text-slate-500 font-medium">
  <Users size={14} className="text-slate-400 mt-0.5" />
  <span>{t.zaloContact || 'Chưa lưu liên hệ Zalo'}</span>
</div>
```

```jsx
// frontend/src/pages/TenantDetailPage.jsx
[
  ['Số điện thoại', tenant.phone || 'Chưa cập nhật'],
  ['Liên hệ Zalo', tenant.zaloContact || 'Chưa cập nhật'],
  ['CCCD/CMND', tenant.idCard || 'Chưa cập nhật'],
]
```

```jsx
// frontend/src/pages/RoomDetailPage.jsx
<p className="text-xs text-slate-400 mt-1">📞 {t.phone || 'Chưa có số điện thoại'}</p>
<p className="text-xs text-slate-400 mt-1">Zalo: {t.zaloContact || 'Chưa có liên hệ Zalo'}</p>
```

```js
// frontend/e2e/happy-path.spec.js
await page.fill('[data-testid="tenant-form-phone"]', '0987654321');
await page.fill('[data-testid="tenant-form-zaloContact"]', 'zalo-happy-path');
```

- [ ] **Step 4: Run the new and existing tenant flow tests**

Run:

```bash
cd frontend
npm run test:e2e -- tenant-contact-flexibility.spec.js happy-path.spec.js
```

Expected:
- new flexible-contact spec PASS
- existing happy path PASS with the additional field filled in

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/TenantsPage.jsx frontend/src/pages/TenantDetailPage.jsx frontend/src/pages/RoomDetailPage.jsx frontend/e2e/tenant-contact-flexibility.spec.js frontend/e2e/happy-path.spec.js
git commit -m "feat: surface optional tenant phone and zalo contact in ui"
```

---

### Task 3: Invoice Notification Modal Fallback Logic

**Files:**
- Create: `frontend/e2e/notification-zalo-fallback.spec.js`
- Modify: `frontend/src/pages/InvoiceDetailPage.jsx`
- Modify: `frontend/e2e/notification-flow.spec.js`

- [ ] **Step 1: Write the failing E2E test for Zalo fallback without phone**

```js
// frontend/e2e/notification-zalo-fallback.spec.js
import { test, expect } from '@playwright/test';

test('shows zaloContact guidance and disables sms when tenant has no phone', async ({ page }) => {
  const uniqueId = Math.floor(Math.random() * 1000000);
  const roomName = `Room Notify ${uniqueId}`;
  const tenantName = `Tenant Notify ${uniqueId}`;

  page.on('dialog', async (dialog) => dialog.accept());

  await page.goto('/login');
  await page.fill('[data-testid="login-email"]', 'admin@test.com');
  await page.fill('[data-testid="login-password"]', 'password123');
  await page.click('[data-testid="login-submit"]');

  await page.click('aside a[href="/rooms"]');
  await page.click('[data-testid="add-room-btn"]');
  await page.fill('[data-testid="room-form-name"]', roomName);
  await page.fill('[data-testid="room-form-baseRent"]', '2000000');
  await page.fill('[data-testid="room-form-electricPrice"]', '3500');
  await page.fill('[data-testid="room-form-waterPrice"]', '15000');
  await page.fill('[data-testid="room-form-garbageFee"]', '20000');
  await page.click('[data-testid="room-form-submit"]');

  await page.click('aside a[href="/tenants"]');
  await page.click('[data-testid="add-tenant-btn"]');
  await page.fill('[data-testid="tenant-form-name"]', tenantName);
  await page.fill('[data-testid="tenant-form-zaloContact"]', 'https://zalo.me/fallback-tenant');
  await page.selectOption('[data-testid="tenant-form-roomId"]', { label: `${roomName} (Trống)` });
  await page.fill('[data-testid="tenant-form-moveInDate"]', '2026-06-01');
  await page.click('[data-testid="tenant-form-submit"]');

  await page.click('aside a[href="/invoices"]');
  await page.click('[data-testid="bulk-create-btn"]');
  const roomCard = page.locator(`a[data-testid^="room-view-detail-"]`).first();
  await page.fill(`[data-testid^="bulk-electricity-now-"]`, '25');
  await page.fill(`[data-testid^="bulk-water-now-"]`, '3');
  await page.click('[data-testid="bulk-confirm-btn"]');

  const invoiceLink = page.locator(`a[data-testid^="invoice-view-detail-"]`).last();
  await invoiceLink.click();
  await page.click('[data-testid="invoice-notify-btn"]');

  await expect(page.locator('[data-testid="notify-zalo-contact"]')).toContainText('https://zalo.me/fallback-tenant');
  await expect(page.locator('[data-testid="notify-sms-btn"]')).toBeDisabled();
  await expect(page.locator('[data-testid="notify-zalo-btn"]')).toContainText('Đã copy, tự mở Zalo');
});
```

- [ ] **Step 2: Run the fallback notification test to verify it fails**

Run:

```bash
cd frontend
npm run test:e2e -- notification-zalo-fallback.spec.js
```

Expected: FAIL because the modal does not render `notify-zalo-contact`, SMS disable state, or fallback Zalo wording.

- [ ] **Step 3: Implement modal branching and safe action handlers**

```jsx
// frontend/src/pages/InvoiceDetailPage.jsx
const tenantPhone = invoice?.tenant?.phone?.trim() || '';
const tenantZaloContact = invoice?.tenant?.zaloContact?.trim() || '';
const canOpenZalo = tenantPhone.length > 0;
const canSendSms = tenantPhone.length > 0;
const hasZaloHint = tenantZaloContact.length > 0;
```

```js
// frontend/src/pages/InvoiceDetailPage.jsx
const handleSendZalo = async () => {
  await navigator.clipboard.writeText(buildMessageText());

  if (canOpenZalo) {
    toast.success('Đã sao chép! Đang mở Zalo...');
    window.open(`https://zalo.me/${tenantPhone}`, '_blank');
    return;
  }

  if (hasZaloHint) {
    toast.success('Đã sao chép nội dung. Hãy mở đúng tài khoản Zalo theo thông tin đã lưu.');
    return;
  }

  toast.error('Khách thuê chưa có số điện thoại hoặc thông tin liên hệ Zalo.');
};
```

```jsx
// frontend/src/pages/InvoiceDetailPage.jsx
{hasZaloHint && (
  <div data-testid="notify-zalo-contact" className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600">
    <span className="font-bold text-slate-800">Liên hệ Zalo đã lưu:</span> {tenantZaloContact}
  </div>
)}
```

```jsx
// frontend/src/pages/InvoiceDetailPage.jsx
<button
  onClick={handleSendSMS}
  data-testid="notify-sms-btn"
  disabled={!canSendSms}
  className="flex items-center gap-1.5 px-4 py-2 border border-slate-100 bg-white rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
>
  <MessageSquare size={13} className="text-slate-500" />
  Gửi SMS
</button>

<button
  onClick={handleSendZalo}
  data-testid="notify-zalo-btn"
  className="flex items-center gap-1.5 px-4 py-2 border border-emerald-200/50 rounded-xl text-xs font-bold bg-[#E8F5E9] hover:bg-[#E8F5E9]/80 text-[#2E7D32]"
>
  <Send size={13} />
  {canOpenZalo ? 'Gửi qua Zalo' : 'Đã copy, tự mở Zalo'}
</button>
```

```js
// frontend/e2e/notification-flow.spec.js
const smsBtn = page.locator('[data-testid="notify-sms-btn"]');
const zaloBtn = page.locator('[data-testid="notify-zalo-btn"]');
await expect(smsBtn).toBeVisible();
await expect(zaloBtn).toBeVisible();
```

- [ ] **Step 4: Run notification regression tests**

Run:

```bash
cd frontend
npm run test:e2e -- notification-flow.spec.js notification-zalo-fallback.spec.js
```

Expected:
- existing notification modal smoke PASS
- new fallback notification test PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/InvoiceDetailPage.jsx frontend/e2e/notification-flow.spec.js frontend/e2e/notification-zalo-fallback.spec.js
git commit -m "feat: add zalo fallback guidance for tenants without phone"
```

---

### Task 4: Governance Sync and Final Verification

**Files:**
- Modify: `AGENTS.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Update governance docs from planned to implemented state**

```md
<!-- AGENTS.md -->
*   **Patch 1.4.6: Tenant Contact Flexibility & Zalo Notification UX**:
    - Cho phép khách thuê không bắt buộc có `phone`.
    - Bổ sung trường `zaloContact` tách biệt.
    - Nâng cấp modal gửi hóa đơn để phân nhánh theo `phone` và `zaloContact`.
```

```md
<!-- CHANGELOG.md -->
## [1.4.6] - 2026-06-08

### Added
- Bổ sung trường `zaloContact` cho khách thuê.

### Changed
- Cho phép tạo khách thuê không có `phone`.
- Vô hiệu hóa SMS khi không có số điện thoại và hiển thị fallback Zalo trong modal gửi thông báo.
```

- [ ] **Step 2: Run final project verification**

Run:

```bash
cd backend
npm test

cd ..\frontend
npm run build
npm run test:e2e -- happy-path.spec.js tenant-contact-flexibility.spec.js notification-flow.spec.js notification-zalo-fallback.spec.js
```

Expected:
- backend tests PASS
- frontend build PASS
- all listed Playwright specs PASS

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md CHANGELOG.md
git commit -m "docs: sync tenant contact and zalo notification updates"
```

---

## Self-Review

- **Spec coverage:** Covered `phone` optionality, `zaloContact` storage, tenant UI display, invoice notification fallback behavior, and governance sync.
- **Placeholder scan:** No `TODO`, `TBD`, or “similar to previous task” shortcuts remain.
- **Type consistency:** The plan consistently uses `phone` and `zaloContact` across Prisma, backend payloads, frontend form data, and E2E selectors.

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-08-tenant-contact-zalo.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
