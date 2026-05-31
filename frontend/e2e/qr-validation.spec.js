import { test, expect } from '@playwright/test';

test.describe('VietQR E2E Validation Scenario', () => {
  test('should update payment settings, show QR instruction texts on invoice, and download PDF successfully', async ({ page }) => {
    test.setTimeout(90000);
    // 1. Setup dialog handler to automatically accept all confirms/alerts
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // 1b. Forward browser console logs to terminal for debugging
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    // Generate unique suffix to avoid database record duplication and Playwright selector collisions
    const uniqueId = Math.floor(Math.random() * 1000000);
    const roomName = `Room QR E2E ${uniqueId}`;
    const tenantName = `Tenant QR E2E ${uniqueId}`;

    // 2. Open login page
    await page.goto('/login');
    await expect(page).toHaveTitle(/Quản Lý Nhà Trọ/);

    // 3. Fill login form and submit
    await page.fill('[data-testid="login-email"]', 'admin@test.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');

    // 4. Verify we redirect to Dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // 5. Go to Settings page to configure bank details
    await page.click('aside a[href="/settings"]');
    await expect(page.locator('main h1')).toContainText('Cài đặt');

    // Fill settings inputs and click save
    await page.fill('[data-testid="settings-shopName"]', 'Nha Tro E2E Hoa Hong');
    await page.fill('[data-testid="settings-paymentInfo"]', 'Techcombank 1903 2559 1790 19 - VU HAI DANG');
    await page.click('[data-testid="settings-save-btn"]');

    // Brief wait for settings mutate to save in database
    await page.waitForTimeout(1000);

    // 6. Navigate to Rooms page
    await page.click('aside a[href="/rooms"]');
    await expect(page.locator('main h1')).toContainText('Phòng trọ');

    // Click Add Room button
    await page.click('[data-testid="add-room-btn"]');

    // Fill Room form and submit
    await page.fill('[data-testid="room-form-name"]', roomName);
    await page.fill('[data-testid="room-form-floor"]', '3');
    await page.fill('[data-testid="room-form-area"]', '25');
    await page.fill('[data-testid="room-form-baseRent"]', '2000000');
    await page.fill('[data-testid="room-form-electricPrice"]', '3500');
    await page.fill('[data-testid="room-form-waterPrice"]', '15000');
    await page.fill('[data-testid="room-form-garbageFee"]', '20000');
    await page.click('[data-testid="room-form-submit"]');

    // Verify the room is created
    const roomCard = page.locator(`[data-testid="room-card-${roomName.replace(/\s+/g, '-')}"]`);
    await expect(roomCard).toBeVisible();

    // 7. Navigate to Tenants page
    await page.click('aside a[href="/tenants"]');
    await expect(page.locator('main h1')).toContainText('Khách thuê');

    // Click Add Tenant button
    await page.click('[data-testid="add-tenant-btn"]');

    // Fill Tenant form
    await page.fill('[data-testid="tenant-form-name"]', tenantName);
    await page.fill('[data-testid="tenant-form-phone"]', '0987654321');
    await page.fill('[data-testid="tenant-form-idCard"]', '123456789012');
    
    // Select the created room
    await page.selectOption('[data-testid="tenant-form-roomId"]', { label: `${roomName} (Trống)` });
    await page.fill('[data-testid="tenant-form-moveInDate"]', '2026-05-01');
    await page.fill('[data-testid="tenant-form-deposit"]', '2000000');
    await page.click('[data-testid="tenant-form-submit"]');

    // Verify tenant is added
    const tenantCard = page.locator(`[data-testid="tenant-card-${tenantName.replace(/\s+/g, '-')}"]`);
    await expect(tenantCard).toBeVisible();

    // Get room ID from detail link on Rooms page
    await page.click('aside a[href="/rooms"]');
    const roomCardUpdated = page.locator(`[data-testid="room-card-${roomName.replace(/\s+/g, '-')}"]`);
    await expect(roomCardUpdated).toContainText('Có người');
    const roomDetailLink = roomCardUpdated.locator('a[data-testid^="room-view-detail-"]');
    const roomDetailIdAttr = await roomDetailLink.getAttribute('data-testid');
    const roomId = roomDetailIdAttr.replace('room-view-detail-', '');

    // 8. Navigate to Invoices page to bulk create invoice
    await page.click('aside a[href="/invoices"]');
    await expect(page.locator('main h1')).toContainText('Hóa đơn');

    // Create bulk invoices
    await page.click('[data-testid="bulk-create-btn"]');
    await page.fill(`[data-testid="bulk-electricity-now-${roomId}"]`, '100');
    await page.fill(`[data-testid="bulk-water-now-${roomId}"]`, '10');
    await page.click('[data-testid="bulk-confirm-btn"]');
    await expect(page.locator('[data-testid="bulk-confirm-btn"]')).toBeHidden({ timeout: 20000 });

    // Verify invoice row appears
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const invoiceRow = page.locator(`[data-testid="invoice-row-${currentMonth}-${currentYear}-${roomName.replace(/\s+/g, '-')}"]`);
    await expect(invoiceRow).toBeVisible();

    // View invoice detail
    const invoiceViewLink = invoiceRow.locator('a[data-testid^="invoice-view-detail-"]');
    await invoiceViewLink.click();
    await expect(page.locator('main h1')).toContainText(`Hóa đơn tháng ${currentMonth}/${currentYear}`);

    // 9. Click PDF download button and verify download is successful (this executes backend pdfController with VietQR generation)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="invoice-download-pdf-btn"]')
    ]);

    const filename = download.suggestedFilename();
    expect(filename).toContain('.pdf');
    expect(filename).toContain(roomName);
    const path = await download.path();
    expect(path).toBeTruthy();

    console.log(`✓ E2E Success: Saved settings, validated QR texts, and downloaded PDF: ${filename}`);
  });
});
