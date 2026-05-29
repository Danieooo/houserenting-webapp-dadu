import { test, expect } from '@playwright/test';

test.describe('Happy Path Scenario', () => {
  test('should complete the entire cycle from room creation to checkout', async ({ page }) => {
    // 1. Setup dialog handler to automatically accept all confirms/alerts
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // 1b. Forward browser console logs to terminal for debugging
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    // Generate unique suffix to avoid database record duplication and Playwright selector collisions
    const uniqueId = Math.floor(Math.random() * 1000000);
    const roomName = `Room E2E ${uniqueId}`;
    const tenantName = `Tenant E2E ${uniqueId}`;

    // 2. Open login page
    await page.goto('/login');
    await expect(page).toHaveTitle(/Quản Lý Nhà Trọ/);

    // 3. Fill login form and submit
    await page.fill('[data-testid="login-email"]', 'admin@test.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');

    // 4. Verify we redirect to Dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // 5. Navigate to Rooms page (using client-side routing via sidebar to preserve accessToken)
    await page.click('aside a[href="/rooms"]');
    await expect(page.locator('main h1')).toContainText('Phòng trọ');

    // 6. Click Add Room button
    await page.click('[data-testid="add-room-btn"]');

    // 7. Fill Room form and submit
    await page.fill('[data-testid="room-form-name"]', roomName);
    await page.fill('[data-testid="room-form-floor"]', '3');
    await page.fill('[data-testid="room-form-area"]', '25');
    await page.fill('[data-testid="room-form-baseRent"]', '2500000');
    await page.fill('[data-testid="room-form-electricPrice"]', '3500');
    await page.fill('[data-testid="room-form-waterPrice"]', '15000');
    await page.fill('[data-testid="room-form-garbageFee"]', '20000');
    await page.click('[data-testid="room-form-submit"]');

    // 8. Verify the room is created and available
    const roomCard = page.locator(`[data-testid="room-card-${roomName.replace(/\s+/g, '-')}"]`);
    await expect(roomCard).toBeVisible();
    await expect(roomCard).toContainText('Trống');

    // 9. Navigate to Tenants page (using client-side routing)
    await page.click('aside a[href="/tenants"]');
    await expect(page.locator('main h1')).toContainText('Khách thuê');

    // 10. Click Add Tenant button
    await page.click('[data-testid="add-tenant-btn"]');

    // 11. Fill Tenant form
    await page.fill('[data-testid="tenant-form-name"]', tenantName);
    await page.fill('[data-testid="tenant-form-phone"]', '0987654321');
    await page.fill('[data-testid="tenant-form-idCard"]', '123456789012');
    
    // Select the created room
    await page.selectOption('[data-testid="tenant-form-roomId"]', { label: `${roomName} (Trống)` });
    
    // Fill move in date
    await page.fill('[data-testid="tenant-form-moveInDate"]', '2026-05-01');
    await page.fill('[data-testid="tenant-form-deposit"]', '2500000');
    await page.click('[data-testid="tenant-form-submit"]');

    // 12. Verify tenant is added in list
    const tenantCard = page.locator(`[data-testid="tenant-card-${tenantName.replace(/\s+/g, '-')}"]`);
    await expect(tenantCard).toBeVisible();
    await expect(tenantCard).toContainText(roomName);

    // 13. Go back to Rooms page (using client-side routing) to verify occupied status
    await page.click('aside a[href="/rooms"]');
    const roomCardUpdated = page.locator(`[data-testid="room-card-${roomName.replace(/\s+/g, '-')}"]`);
    await expect(roomCardUpdated).toContainText('Có người');

    // Get room ID from detail link
    const roomDetailLink = roomCardUpdated.locator('a[data-testid^="room-view-detail-"]');
    const roomDetailIdAttr = await roomDetailLink.getAttribute('data-testid');
    const roomId = roomDetailIdAttr.replace('room-view-detail-', '');

    // 14. Navigate to Invoices page (using client-side routing)
    await page.click('aside a[href="/invoices"]');
    await expect(page.locator('main h1')).toContainText('Hóa đơn');

    // 15. Create bulk invoices
    await page.click('[data-testid="bulk-create-btn"]');
    
    // Input electric and water indexes
    await page.fill(`[data-testid="bulk-electricity-now-${roomId}"]`, '100');
    await page.fill(`[data-testid="bulk-water-now-${roomId}"]`, '10');
    await page.click('[data-testid="bulk-confirm-btn"]');

    // 16. Verify invoice row appears
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const invoiceRow = page.locator(`[data-testid="invoice-row-${currentMonth}-${currentYear}-${roomName.replace(/\s+/g, '-')}"]`);
    await expect(invoiceRow).toBeVisible();
    await expect(invoiceRow).toContainText('Chưa thu');

    // View invoice detail (client-side click)
    const invoiceViewLink = invoiceRow.locator('a[data-testid^="invoice-view-detail-"]');
    await invoiceViewLink.click();
    await expect(page.locator('main h1')).toContainText(`Hóa đơn tháng ${currentMonth}/${currentYear}`);

    // Verify calculated amount:
    // Base rent: 2,500,000
    // Electricity: 100 * 3,500 = 350,000
    // Water: 10 * 15,000 = 150,000
    // Garbage: 20,000
    // Total: 3,020,000
    const totalAmountSpan = page.locator('[data-testid="invoice-total-amount"]');
    await expect(totalAmountSpan).toContainText('3.020.000');

    // 17. Record payment
    await page.click('[data-testid="invoice-pay-btn"]');
    
    // Verify invoice paid state
    await expect(page.locator('.bg-green-100.text-green-700')).toContainText('Đã thu');

    // 18. Go to tenant detail page to checkout (using client-side navigation)
    await page.click('aside a[href="/tenants"]');
    const tenantCardFinal = page.locator(`[data-testid="tenant-card-${tenantName.replace(/\s+/g, '-')}"]`);
    await tenantCardFinal.locator('a[data-testid^="tenant-view-detail-"]').click();
    await expect(page.locator('main h1')).toContainText(tenantName);

    // Click checkout
    await page.click(`button:has-text("Chuyển ra")`);

    // Verify tenant is marked active: false / "Đã rời đi"
    await expect(page.locator('text=Đã rời đi')).toBeVisible();

    // 19. Verify room is available again (using client-side navigation)
    await page.click('aside a[href="/rooms"]');
    const roomCardFinal = page.locator(`[data-testid="room-card-${roomName.replace(/\s+/g, '-')}"]`);
    await expect(roomCardFinal).toContainText('Trống');
  });
});
