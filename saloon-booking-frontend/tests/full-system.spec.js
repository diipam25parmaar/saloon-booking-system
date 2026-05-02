import { test, expect } from '@playwright/test';

const runFlow = async (page, isDarkTheme) => {
  const uniqueId = Date.now().toString().slice(-7);
  const serviceCategoryName = `QA Service Category ${uniqueId}`;
  const crudCategoryName = `QA Crud Category ${uniqueId}`;
  const editedCrudCategoryName = `${crudCategoryName} Updated`;
  const serviceName = `QA Service ${uniqueId}`;
  const bookingName = `QA Customer ${uniqueId}`;
  const customerEmail = `qa.customer.${uniqueId}@example.com`;
  const customerPassword = 'password123';
  const bookingPhone = '9876543210';
  const bookingDateForRule = new Date();
  bookingDateForRule.setDate(bookingDateForRule.getDate() + 10);
  const ruleDate = bookingDateForRule.toISOString().split('T')[0];
  const pause = async (ms = 6000) => page.waitForTimeout(ms);
  const loginAndExpectUrl = async (email, password, targetUrlRegex) => {
    await expect(page.locator('#login-email')).toBeVisible();
    await page.fill('#login-email', email);
    await page.fill('#login-password', password);
    await page.click('#login-submit');

    try {
      await expect(page).toHaveURL(targetUrlRegex, { timeout: 20000 });
    } catch (error) {
      const loginError = await page.locator('.error').first().textContent().catch(() => null);
      const currentUrl = page.url();
      throw new Error(
        `Login failed for ${email}. URL: ${currentUrl}. UI error: ${loginError || 'none visible'}`
      );
    }
  };
  const chooseFutureWeekdayWithSlots = async () => {
    const loadingSlots = page.locator('.loading-text', { hasText: 'Loading available slots' });
    for (let offset = 1; offset <= 30; offset++) {
      const candidate = new Date();
      candidate.setDate(candidate.getDate() + offset);
      const day = candidate.getDay();
      if (day === 0 || day === 6) continue;
      const dateString = candidate.toISOString().split('T')[0];
      await page.fill('#bk-date', dateString);
      await expect(page.locator('#bk-date')).toHaveValue(dateString);
      await loadingSlots.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      const enabledSlots = page.locator('.slot-btn:not([disabled])');
      if ((await enabledSlots.count()) > 0) return dateString;
    }
    throw new Error('No available future weekday slots found in next 30 days.');
  };

  await page.goto('/login');

  if (isDarkTheme) {
    await page.click('.theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await pause(2000);
  }

  // ----- Admin flow -----
  await loginAndExpectUrl('admin@example.com', 'password123', /\/admin(?:\/)?$/);
  await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible();
  await pause(9000);

  // Working Time Rules: add rule from dashboard
  await expect(page.locator('#rule-date')).toBeVisible();
  await page.fill('#rule-date', ruleDate);
  await page.fill('#rule-start', '09:00');
  await page.fill('#rule-end', '18:00');
  await page.getByRole('button', { name: 'Add Rule' }).click();
  await expect(page.locator('.success')).toContainText(/rule created successfully/i);

  // Categories: add category for service linking
  await page.getByRole('link', { name: 'Categories' }).click();
  await expect(page).toHaveURL(/\/admin\/categories$/);
  await expect(page.locator('#cat-name')).toBeVisible();
  await page.fill('#cat-name', serviceCategoryName);
  await page.selectOption('#cat-status', 'true');
  await page.click('#cat-submit');
  await expect(page.locator('tr', { hasText: serviceCategoryName }).first()).toBeVisible({ timeout: 15000 });

  // Categories: add -> edit -> delete for CRUD validation
  await page.fill('#cat-name', crudCategoryName);
  await page.selectOption('#cat-status', 'true');
  await page.click('#cat-submit');
  
  const crudRow = page.locator('tr', { hasText: crudCategoryName }).first();
  await expect(crudRow).toBeVisible({ timeout: 15000 });
  await crudRow.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('#cat-name')).toHaveValue(crudCategoryName);
  await page.fill('#cat-name', editedCrudCategoryName);
  await page.click('#cat-submit');
  
  const editedCrudRow = page.locator('tr', { hasText: editedCrudCategoryName }).first();
  await expect(editedCrudRow).toBeVisible({ timeout: 15000 });
  page.once('dialog', (dialog) => dialog.accept());
  await editedCrudRow.getByRole('button', { name: 'Delete' }).click();
  await expect(editedCrudRow).toBeHidden({ timeout: 15000 });

  // Services: add service linked to created category
  await page.getByRole('link', { name: 'Services' }).click();
  await expect(page).toHaveURL(/\/admin\/services$/);
  await expect(page.locator('#svc-name')).toBeVisible();

  await page.fill('#svc-name', serviceName);
  await page.selectOption('#svc-category', { label: serviceCategoryName });
  await page.fill('#svc-duration', '30');
  await page.fill('#svc-price', '99.99');
  await page.selectOption('#svc-status', 'true');
  await page.click('#svc-submit');

  await expect(page.locator('tr', { hasText: serviceName }).first()).toBeVisible({ timeout: 15000 });

  // Bookings page: view bookings screen before customer books
  await page.getByRole('link', { name: 'Bookings' }).click();
  await expect(page).toHaveURL(/\/admin\/bookings$/);
  await expect(page.getByText('View and manage all customer appointments')).toBeVisible();
  await pause(9000);

  await page.getByRole('button', { name: /Logout/i }).click();
  await expect(page).toHaveURL(/\/(login|booking)$/);
  await pause(7000);

  // Customer registration (if needed / fresh account for deterministic run)
  await page.goto('/register');
  await expect(page.locator('#reg-name')).toBeVisible();
  await page.fill('#reg-name', bookingName);
  await page.fill('#reg-email', customerEmail);
  await page.fill('#reg-password', customerPassword);
  await page.click('#register-submit');
  await expect(page).toHaveURL(/\/booking$/);
  await pause(9000);

  // Logout after registration to perform explicit customer login flow
  await page.getByRole('button', { name: /Logout/i }).click();
  await expect(page).toHaveURL(/\/(login|booking)$/);
  await pause(7000);

  // ----- Customer flow -----
  await page.goto('/login');
  await loginAndExpectUrl(customerEmail, customerPassword, /\/booking$/);
  await expect(page.locator('#bk-category')).toBeVisible();
  await pause(7000);

  await page.selectOption('#bk-category', { label: serviceCategoryName });
  await expect(page.locator('#bk-service')).toBeEnabled();
  await pause(7000);

  const serviceOptionValue = await page.locator('#bk-service option').evaluateAll((options, expectedName) => {
    const target = options.find((opt) => opt.textContent?.trim().startsWith(expectedName));
    return target?.getAttribute('value') || '';
  }, serviceName);
  expect(serviceOptionValue).not.toBe('');
  await page.selectOption('#bk-service', serviceOptionValue);
  await expect(page.locator('#bk-date')).toBeEnabled();
  await pause(7000);

  const dateString = await chooseFutureWeekdayWithSlots();
  await pause(2500);

  const firstAvailableSlot = page.locator('.slot-btn:not([disabled])').first();
  await expect(firstAvailableSlot).toBeVisible({ timeout: 10000 });
  const selectedSlotLabel = (await firstAvailableSlot.locator('span').first().innerText()).trim();
  await firstAvailableSlot.click();
  await expect(firstAvailableSlot).toHaveClass(/selected/);
  await pause(9000);

  await page.fill('#bk-name', bookingName);
  await page.fill('#bk-phone', bookingPhone);
  await expect(page.locator('#bk-email')).toHaveAttribute('readonly', '');
  await pause(7000);

  await page.click('#bk-submit');
  const bookingSuccess = page.locator('.success').first();
  await expect(bookingSuccess).toContainText(/successfully/i, { timeout: 20000 });
  await pause(9000);

  // Validate slot unavailability (if backend marks slot as booked immediately).
  const slotAfterBooking = page.locator('.slot-btn', { hasText: selectedSlotLabel }).first();
  if ((await slotAfterBooking.count()) > 0) {
    await expect.soft(slotAfterBooking).toBeDisabled();
  }
  await pause(7000);

  // ----- Admin verification after customer booking -----
  await page.getByRole('button', { name: /Logout/i }).click();
  await expect(page).toHaveURL(/\/(login|booking)$/);
  await pause(7000);

  await page.goto('/login');
  await loginAndExpectUrl('admin@example.com', 'password123', /\/admin(?:\/)?$/);
  await pause(7000);

  await page.getByRole('link', { name: 'Bookings' }).click();
  await expect(page).toHaveURL(/\/admin\/bookings$/);
  const bookingRow = page.locator('tr', { hasText: bookingName }).first();
  await expect(bookingRow).toBeVisible({ timeout: 20000 });
  await pause();

  page.once('dialog', (dialog) => dialog.accept());
  await bookingRow.getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('.success').first()).toContainText(/booking cancelled successfully/i, { timeout: 20000 });

  // Keep final state visible for recording readability.
  await page.waitForTimeout(10000);
};

import { execSync } from 'child_process';

test.describe('End-to-End Complete Execution', () => {
  test.beforeEach(() => {
    console.log('Resetting database...');
    execSync('php artisan migrate:fresh --seed --seeder=DemoDataSeeder --force', {
      cwd: '../saloon-booking-backend',
      stdio: 'ignore'
    });
  });

  test('Complete Admin + Customer flow in LIGHT THEME', async ({ page }) => {
    test.setTimeout(480000);
    await runFlow(page, false);
  });

  test('Complete Admin + Customer flow in DARK THEME', async ({ page }) => {
    test.setTimeout(480000);
    await runFlow(page, true);
  });
});
