import { test, expect } from '@playwright/test';

test('app shows no slots when AI returns sentinel', async ({ page, request }) => {
  // intercept the API call and return the sentinel response
  await page.route('**/api/generate', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: 'No available slots found.' }) });
  });

  await page.goto('/');

  // If the app shows setup when no calendlyUrl in localStorage, save one and reload
  await page.evaluate(() => {
    localStorage.setItem('calendlyUrl', 'https://calendly.com/example/30min');
  });
  await page.reload();

  // Click the Find slots button (uses SlotFinder component). Select timezone if needed
  await page.click('button[type="submit"]');

  // Wait for the results area and expect the no-results message
  await expect(page.locator('text=No Available Slots Found')).toBeVisible({ timeout: 10000 });
});
