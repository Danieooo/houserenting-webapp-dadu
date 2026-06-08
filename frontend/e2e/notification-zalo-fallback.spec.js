import { test, expect } from '@playwright/test';

test('keeps invoice notification usable when tenant has no phone but has zaloContact', async ({ page }) => {
  test.setTimeout(90000);

  const uniqueId = Math.floor(Math.random() * 1000000);
  const roomName = `Room Notify ${uniqueId}`;
  const tenantName = `Tenant Notify ${uniqueId}`;
  const zaloContact = `zalo-fallback-${uniqueId}`;

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.addInitScript(() => {
    window.__openedUrls = [];
    window.__copiedText = '';

    window.open = (url) => {
      window.__openedUrls.push(url);
      return null;
    };

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.__copiedText = text;
        },
      },
    });
  });

  await page.goto('/login');
  await page.fill('[data-testid="login-email"]', 'admin@test.com');
  await page.fill('[data-testid="login-password"]', 'password123');
  await page.click('[data-testid="login-submit"]');
  await expect(page).toHaveURL(/.*dashboard/);

  await page.click('aside a[href="/rooms"]');
  await page.click('[data-testid="add-room-btn"]');
  await page.fill('[data-testid="room-form-name"]', roomName);
  await page.fill('[data-testid="room-form-baseRent"]', '1800000');
  await page.fill('[data-testid="room-form-electricPrice"]', '3500');
  await page.fill('[data-testid="room-form-waterPrice"]', '15000');
  await page.fill('[data-testid="room-form-garbageFee"]', '20000');
  await page.click('[data-testid="room-form-submit"]');
  await expect(page.locator('[data-testid="room-form-submit"]')).toBeHidden();

  await page.reload();
  const roomCard = page.locator('[data-testid^="room-card-"]').filter({ hasText: roomName }).first();
  await expect(roomCard).toBeVisible({ timeout: 20000 });
  const roomId = (await roomCard.locator('a[data-testid^="room-view-detail-"]').getAttribute('data-testid')).replace('room-view-detail-', '');

  await page.click('aside a[href="/tenants"]');
  await page.click('[data-testid="add-tenant-btn"]');
  await page.fill('[data-testid="tenant-form-name"]', tenantName);
  await page.fill('[data-testid="tenant-form-zaloContact"]', zaloContact);
  await page.selectOption('[data-testid="tenant-form-roomId"]', roomId);
  await page.fill('[data-testid="tenant-form-moveInDate"]', '2026-06-01');
  await page.click('[data-testid="tenant-form-submit"]');
  await expect(page.locator('[data-testid="tenant-form-submit"]')).toBeHidden();

  await page.click('aside a[href="/invoices"]');
  await page.click('[data-testid="bulk-create-btn"]');
  await page.fill(`[data-testid^="bulk-electricity-now-${roomId}"]`, '50');
  await page.fill(`[data-testid^="bulk-water-now-${roomId}"]`, '8');
  await page.click('[data-testid="bulk-confirm-btn"]');
  await expect(page.locator('[data-testid="bulk-confirm-btn"]')).toBeHidden({ timeout: 20000 });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const invoiceRow = page.locator('[data-testid^="invoice-row-"]')
    .filter({ hasText: roomName })
    .filter({ hasText: `${currentMonth}/${currentYear}` })
    .first();
  await expect(invoiceRow).toBeVisible({ timeout: 20000 });
  await invoiceRow.locator('a[data-testid^="invoice-view-detail-"]').click();

  await page.click('[data-testid="invoice-notify-btn"]');

  await expect(page.locator('[data-testid="notify-zalo-contact"]')).toContainText(zaloContact);
  await expect(page.locator('[data-testid="notify-sms-btn"]')).toBeDisabled();

  await page.click('[data-testid="notify-zalo-btn"]');

  await expect.poll(async () => page.evaluate(() => window.__copiedText)).toContain('THÔNG BÁO TIỀN PHÒNG');
  await expect.poll(async () => page.evaluate(() => window.__openedUrls.length)).toBe(0);
});
