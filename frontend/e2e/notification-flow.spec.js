import { test, expect } from '@playwright/test';

test.describe('Smart Notification E2E Scenario', () => {
  test('opens the invoice notification modal with copy, Zalo, SMS, and webhook actions for tenants with phone', async ({ page }) => {
    test.setTimeout(90000);
    const uniqueId = Math.floor(Math.random() * 1000000);
    const roomName = `Room Notify Phone ${uniqueId}`;
    const tenantName = `Tenant Notify Phone ${uniqueId}`;

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
    await expect(page).toHaveTitle(/Quản Lý Nhà Trọ/);

    await page.fill('[data-testid="login-email"]', 'admin@test.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    await page.click('aside a[href="/settings"]');
    await expect(page.locator('main h1')).toContainText('Cài đặt');

    await expect(page.locator('[data-testid="settings-webhookUrl"]')).toBeVisible();
    await page.fill('[data-testid="settings-shopName"]', 'Nha Tro Hoa Hong E2E');
    await page.fill('[data-testid="settings-webhookUrl"]', 'https://discord.com/api/webhooks/dummy-url');
    await page.click('[data-testid="settings-save-btn"]');
    await expect(page.locator('[data-testid="settings-save-btn"]')).toBeEnabled({ timeout: 20000 });

    await page.click('aside a[href="/rooms"]');
    await page.click('[data-testid="add-room-btn"]');
    await page.fill('[data-testid="room-form-name"]', roomName);
    await page.fill('[data-testid="room-form-baseRent"]', '2100000');
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
    await page.fill('[data-testid="tenant-form-phone"]', '0987654321');
    await page.fill('[data-testid="tenant-form-zaloContact"]', 'zalo-notify-phone');
    await page.selectOption('[data-testid="tenant-form-roomId"]', roomId);
    await page.fill('[data-testid="tenant-form-moveInDate"]', '2026-06-01');
    await page.click('[data-testid="tenant-form-submit"]');
    await expect(page.locator('[data-testid="tenant-form-submit"]')).toBeHidden();

    await page.click('aside a[href="/invoices"]');
    await expect(page.locator('main h1')).toContainText('Hóa đơn');
    await page.click('[data-testid="bulk-create-btn"]');
    await page.fill(`[data-testid^="bulk-electricity-now-${roomId}"]`, '60');
    await page.fill(`[data-testid^="bulk-water-now-${roomId}"]`, '6');
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

    await expect(page.locator('main h1')).toContainText(/Hóa đơn tháng/);

    const notifyBtn = page.locator('[data-testid="invoice-notify-btn"]');
    await expect(notifyBtn).toBeVisible();
    await notifyBtn.click();

    await expect(page.locator('h3:has-text("Gửi thông báo hóa đơn")')).toBeVisible();
    await expect(page.locator('pre')).toContainText(/THÔNG BÁO TIỀN PHÒNG/);

    const copyBtn = page.locator('[data-testid="notify-copy-btn"]');
    const smsBtn = page.locator('[data-testid="notify-sms-btn"]');
    const zaloBtn = page.locator('[data-testid="notify-zalo-btn"]');
    const webhookBtn = page.locator('button:has-text("Đẩy Webhook")');

    await expect(copyBtn).toBeVisible();
    await expect(smsBtn).toBeEnabled();
    await expect(zaloBtn).toContainText('Mở chat Zalo');
    await expect(webhookBtn).toBeVisible({ timeout: 20000 });
    await expect(page.locator('[data-testid="notify-phone"]')).toBeVisible();

    await copyBtn.click();
    await expect.poll(async () => page.evaluate(() => window.__copiedText)).toContain('THÔNG BÁO TIỀN PHÒNG');

    await zaloBtn.click();
    await expect.poll(async () => page.evaluate(() => window.__openedUrls.at(-1))).toMatch(/^https:\/\/zalo\.me\//);

    await smsBtn.click();
    await expect.poll(async () => page.evaluate(() => window.__openedUrls.at(-1))).toMatch(/^sms:/);

    await page.click('[data-testid="close-notify-modal-btn"]');
  });
});
