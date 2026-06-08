import { test, expect } from '@playwright/test';

test('allows creating a tenant with empty phone and saved zaloContact', async ({ page }) => {
  test.setTimeout(90000);

  const uniqueId = Math.floor(Math.random() * 1000000);
  const roomName = `Room Zalo ${uniqueId}`;
  const tenantName = `Tenant Zalo ${uniqueId}`;

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.goto('/login');
  await page.fill('[data-testid="login-email"]', 'admin@test.com');
  await page.fill('[data-testid="login-password"]', 'password123');
  await page.click('[data-testid="login-submit"]');
  await expect(page).toHaveURL(/.*dashboard/);

  await page.click('aside a[href="/rooms"]');
  await expect(page.locator('main h1')).toContainText('Phòng trọ');
  await page.click('[data-testid="add-room-btn"]');
  await page.fill('[data-testid="room-form-name"]', roomName);
  await page.fill('[data-testid="room-form-baseRent"]', '2000000');
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
  await expect(page.locator('main h1')).toContainText('Khách thuê');
  await page.click('[data-testid="add-tenant-btn"]');
  await page.fill('[data-testid="tenant-form-name"]', tenantName);
  await page.fill('[data-testid="tenant-form-zaloContact"]', 'zalo-user-flexible');
  await page.selectOption('[data-testid="tenant-form-roomId"]', roomId);
  await page.fill('[data-testid="tenant-form-moveInDate"]', '2026-06-01');
  await page.click('[data-testid="tenant-form-submit"]');
  await expect(page.locator('[data-testid="tenant-form-submit"]')).toBeHidden();

  const tenantCard = page.locator('[data-testid^="tenant-card-"]').filter({ hasText: tenantName }).first();
  await expect(tenantCard).toBeVisible({ timeout: 20000 });
  await expect(tenantCard).toContainText('zalo-user-flexible');
});
