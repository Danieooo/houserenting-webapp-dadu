import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/login');
  await page.fill('[data-testid="login-email"]', 'admin@test.com');
  await page.fill('[data-testid="login-password"]', 'password123');
  await page.click('[data-testid="login-submit"]');
  await expect(page).toHaveURL(/.*dashboard/);
}

test('locks room form actions while saving a room', async ({ page }) => {
  test.setTimeout(90000);

  await page.route('**/api/rooms', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
    const response = await route.fetch();
    await route.fulfill({ response });
  });

  await login(page);

  await page.click('aside a[href="/rooms"]');
  await page.click('[data-testid="add-room-btn"]');
  await page.fill('[data-testid="room-form-name"]', `Room Guard ${Date.now()}`);
  await page.fill('[data-testid="room-form-baseRent"]', '2500000');
  await page.click('[data-testid="room-form-submit"]');

  await expect(page.locator('[data-testid="room-form-submit"]')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Hủy' })).toBeDisabled();
  await expect(page.locator('[data-testid="room-form-submit"]')).toBeHidden({ timeout: 20000 });
  await page.unroute('**/api/rooms');
});

test('shows the Zalo field clearly and locks tenant form while saving', async ({ page }) => {
  test.setTimeout(90000);

  const uniqueId = Date.now();
  const roomName = `Tenant Guard Room ${uniqueId}`;

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await login(page);

  await page.click('aside a[href="/rooms"]');
  await page.click('[data-testid="add-room-btn"]');
  await page.fill('[data-testid="room-form-name"]', roomName);
  await page.fill('[data-testid="room-form-baseRent"]', '2100000');
  await page.click('[data-testid="room-form-submit"]');
  await expect(page.locator('[data-testid="room-form-submit"]')).toBeHidden();

  await page.reload();
  const roomCard = page.locator('[data-testid^="room-card-"]').filter({ hasText: roomName }).first();
  await expect(roomCard).toBeVisible({ timeout: 20000 });
  const roomId = (await roomCard.locator('a[data-testid^="room-view-detail-"]').getAttribute('data-testid')).replace('room-view-detail-', '');

  await page.route('**/api/tenants', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
    const response = await route.fetch();
    await route.fulfill({ response });
  });

  await page.click('aside a[href="/tenants"]');
  await page.click('[data-testid="add-tenant-btn"]');

  await expect(page.locator('[data-testid="tenant-form-zaloContact"]')).toBeVisible();
  await expect(page.getByText('Không có số điện thoại? Hãy lưu tài khoản hoặc ghi chú Zalo ở ô bên dưới để còn tìm đúng khách khi gửi hóa đơn.')).toBeVisible();

  await page.fill('[data-testid="tenant-form-name"]', `Tenant Guard ${uniqueId}`);
  await page.fill('[data-testid="tenant-form-zaloContact"]', `zalo-guard-${uniqueId}`);
  await page.selectOption('[data-testid="tenant-form-roomId"]', roomId);
  await page.fill('[data-testid="tenant-form-moveInDate"]', '2026-06-08');
  await page.click('[data-testid="tenant-form-submit"]');

  await expect(page.locator('[data-testid="tenant-form-submit"]')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Hủy' })).toBeDisabled();
  await expect(page.locator('[data-testid="tenant-form-submit"]')).toBeHidden({ timeout: 20000 });
  await page.unroute('**/api/tenants');
});
