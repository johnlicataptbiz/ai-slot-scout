import { test } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('accessibility check on main page', async ({ page }) => {
  await page.goto('/');
  // ensure app loads
  await page.waitForLoadState('networkidle');
  // inject axe and run basic checks
  await injectAxe(page);
  await checkA11y(page, null, { detailedReport: true });
});
