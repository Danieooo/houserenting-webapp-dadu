import { test, expect } from '@playwright/test';

test.describe('Smart Notification E2E Scenario', () => {
  test('should configure Webhook URL and open notification share modal on invoice detail successfully', async ({ page }) => {
    // 1. Setup dialog handler to automatically accept all confirms/alerts
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // 2. Open login page
    await page.goto('/login');
    await expect(page).toHaveTitle(/Quản Lý Nhà Trọ/);

    // 3. Fill login form and submit
    await page.fill('[data-testid="login-email"]', 'admin@test.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');

    // 4. Verify we redirect to Dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // 5. Go to Settings page to configure Webhook URL
    await page.click('aside a[href="/settings"]');
    await expect(page.locator('main h1')).toContainText('Cài đặt');

    // Verify input for webhookUrl exists
    const webhookInput = page.locator('[data-testid="settings-webhookUrl"]');
    await expect(webhookInput).toBeVisible();

    // Fill settings inputs and click save
    await page.fill('[data-testid="settings-shopName"]', 'Nha Tro Hoa Hong E2E');
    await page.fill('[data-testid="settings-webhookUrl"]', 'https://discord.com/api/webhooks/dummy-url');
    await page.click('[data-testid="settings-save-btn"]');

    // Brief wait for settings mutate to save in database
    await page.waitForTimeout(1000);

    // 6. Navigate to Invoices page
    await page.click('aside a[href="/invoices"]');
    await expect(page.locator('main h1')).toContainText('Hóa đơn');

    // Select the first visible invoice row's detail link
    const firstInvoiceDetailLink = page.locator('a[data-testid^="invoice-view-detail-"]').first();
    await expect(firstInvoiceDetailLink).toBeVisible();
    await firstInvoiceDetailLink.click();

    // 7. Verify we are on Invoice Detail Page
    await expect(page.locator('main h1')).toContainText(/Hóa đơn tháng/);

    // Verify the "Gửi thông báo" button is present and click it
    const notifyBtn = page.locator('[data-testid="invoice-notify-btn"]');
    await expect(notifyBtn).toBeVisible();
    await notifyBtn.click();

    // 8. Verify the notification share modal is displayed
    const modalHeader = page.locator('h3:has-text("Gửi thông báo hóa đơn")');
    await expect(modalHeader).toBeVisible();

    // Verify preview box displays formatted text
    const previewBox = page.locator('pre');
    await expect(previewBox).toBeVisible();
    await expect(previewBox).toContainText(/THÔNG BÁO TIỀN PHÒNG/);

    // Verify control buttons in footer
    const copyBtn = page.locator('button:has-text("Copy tin nhắn")');
    await expect(copyBtn).toBeVisible();

    const smsBtn = page.locator('button:has-text("Gửi SMS")');
    await expect(smsBtn).toBeVisible();

    const zaloBtn = page.locator('button:has-text("Gửi qua Zalo")');
    await expect(zaloBtn).toBeVisible();

    const webhookBtn = page.locator('button:has-text("Đẩy Webhook")');
    await expect(webhookBtn).toBeVisible();

    // Close modal
    const closeBtn = page.locator('[data-testid="close-notify-modal-btn"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    console.log('✓ E2E Success: Configured Webhook URL and opened Smart Notification modal successfully!');
  });
});
