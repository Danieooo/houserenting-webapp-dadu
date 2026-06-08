import { test, expect } from '@playwright/test';

test.describe('Happy Path Scenario', () => {
  test('should complete the entire cycle from room creation to checkout', async ({ page }) => {
    test.setTimeout(90000);

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));

    const uniqueId = Math.floor(Math.random() * 1000000);
    const roomName = `Room E2E ${uniqueId}`;
    const tenantName = `Tenant E2E ${uniqueId}`;

    await page.goto('/login');
    await expect(page).toHaveTitle(/Quản Lý Nhà Trọ/);

    await page.fill('[data-testid="login-email"]', 'admin@test.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    await page.click('aside a[href="/rooms"]');
    await expect(page.locator('main h1')).toContainText('Phòng trọ');

    await page.click('[data-testid="add-room-btn"]');
    await page.fill('[data-testid="room-form-name"]', roomName);
    await page.fill('[data-testid="room-form-floor"]', '3');
    await page.fill('[data-testid="room-form-area"]', '25');
    await page.fill('[data-testid="room-form-baseRent"]', '2500000');
    await page.fill('[data-testid="room-form-electricPrice"]', '3500');
    await page.fill('[data-testid="room-form-waterPrice"]', '15000');
    await page.fill('[data-testid="room-form-garbageFee"]', '20000');
    await page.click('[data-testid="room-form-submit"]');
    await expect(page.locator('[data-testid="room-form-submit"]')).toBeHidden();

    await page.reload();
    const roomCardAfterReload = page.locator('[data-testid^="room-card-"]').filter({ hasText: roomName }).first();
    await expect(roomCardAfterReload).toBeVisible({ timeout: 20000 });
    const roomId = (await roomCardAfterReload.locator('a[data-testid^="room-view-detail-"]').getAttribute('data-testid')).replace('room-view-detail-', '');

    await page.click('aside a[href="/tenants"]');
    await expect(page.locator('main h1')).toContainText('Khách thuê');
    await page.click('[data-testid="add-tenant-btn"]');

    await page.fill('[data-testid="tenant-form-name"]', tenantName);
    await page.fill('[data-testid="tenant-form-phone"]', '0987654321');
    await page.fill('[data-testid="tenant-form-zaloContact"]', 'zalo-happy-path');
    await page.fill('[data-testid="tenant-form-idCard"]', '123456789012');
    await page.selectOption('[data-testid="tenant-form-roomId"]', roomId);
    await page.fill('[data-testid="tenant-form-moveInDate"]', '2026-05-01');
    await page.fill('[data-testid="tenant-form-deposit"]', '2500000');
    await page.click('[data-testid="tenant-form-submit"]');
    await expect(page.locator('[data-testid="tenant-form-submit"]')).toBeHidden();

    const tenantCard = page.locator('[data-testid^="tenant-card-"]').filter({ hasText: tenantName }).first();
    await expect(tenantCard).toBeVisible({ timeout: 20000 });
    await expect(tenantCard).toContainText(roomName);

    await page.click('aside a[href="/rooms"]');
    const roomCard = page.locator('[data-testid^="room-card-"]').filter({
      has: page.locator(`a[data-testid="room-view-detail-${roomId}"]`)
    }).first();
    await expect(roomCard).toContainText('Có người');

    await page.click('aside a[href="/invoices"]');
    await expect(page.locator('main h1')).toContainText('Hóa đơn');

    await page.click('[data-testid="bulk-create-btn"]');
    await page.fill(`[data-testid^="bulk-electricity-now-${roomId}"]`, '100');
    await page.fill(`[data-testid^="bulk-water-now-${roomId}"]`, '10');
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
    await expect(invoiceRow).toContainText('Chưa thu');

    await invoiceRow.locator('a[data-testid^="invoice-view-detail-"]').click();
    await expect(page.locator('main h1')).toContainText(`Hóa đơn tháng ${currentMonth}/${currentYear}`);

    const totalAmountSpan = page.locator('[data-testid="invoice-total-amount"]');
    await expect(totalAmountSpan).toContainText('3.020.000');

    await page.click('[data-testid="invoice-pay-btn"]');
    await expect(page.locator('main')).toContainText('Đã thu');

    await page.click('aside a[href="/tenants"]');
    const tenantCardFinal = page.locator('[data-testid^="tenant-card-"]').filter({ hasText: tenantName }).first();
    await tenantCardFinal.locator('a[data-testid^="tenant-view-detail-"]').click();
    await expect(page.locator('main h1')).toContainText(tenantName);

    await page.click('button:has-text("Chuyển ra")');
    await expect(page.locator('text=Đã rời đi')).toBeVisible();

    await page.click('aside a[href="/rooms"]');
    const roomCardFinal = page.locator('[data-testid^="room-card-"]').filter({
      has: page.locator(`a[data-testid="room-view-detail-${roomId}"]`)
    }).first();
    await expect(roomCardFinal).toContainText('Trống');
  });
});
