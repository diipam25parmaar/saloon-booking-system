const { test, expect } = require('@playwright/test');

test.use({
    video: 'on',
});

test('Full Booking Flow Test', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Booking flow
    await page.click('text=Book');

    await page.selectOption('select[name="category"]', { index: 1 });
    await page.selectOption('select[name="service"]', { index: 1 });

    await page.fill('input[type="date"]', '2026-05-10');

    await page.click('.slot'); // select slot

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="phone"]', '9999999999');
    await page.fill('input[name="email"]', 'test@example.com');

    await page.click('text=Confirm Appointment');

    await expect(page.locator('text=success')).toBeVisible();
});