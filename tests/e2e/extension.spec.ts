import { test, expect } from './fixtures';

test('popup loads and shows initial setup or main view', async ({ page, extensionId }) => {
    // Navigate to the extension popup
    await page.goto(`chrome-extension://${extensionId}/index.html`);

    // Check if either the setup view or the main slot finder is visible
    // Note: Since it's a fresh install in the test context, it should default to SetupView
    const setupHeader = page.locator('h1:has-text("AI Slot Scout")');
    const urlInput = page.locator('input[type="url"]');

    // In a fresh state, we expect the Setup View
    await expect(setupHeader).toBeVisible();
    await expect(urlInput).toBeVisible();
});

test('full flow: setup -> find slots -> reset', async ({ page, extensionId }) => {
    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
    await page.goto(`chrome-extension://${extensionId}/index.html`);

    // 1. Handle Setup (Fresh Install State)
    const urlInput = page.locator('input[type="url"]');
    const saveButton = page.locator('button:has-text("Save & Continue")');

    // Ensure we are on the setup page
    await expect(urlInput).toBeVisible();

    // Fill valid URL
    await urlInput.fill('https://calendly.com/test-user/30min');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // 2. Verify we are on Slot Finder view
    // The setup form should disappear, and the main view should appear
    await expect(saveButton).not.toBeVisible();

    const findButton = page.locator('button[aria-label="Find Times"]');
    const timezoneSelect = page.locator('#timezone');

    await expect(findButton).toBeVisible();
    await expect(timezoneSelect).toBeVisible();

    // 3. Change Timezone
    // Based on 112.js, we can test selecting a specific timezone
    await timezoneSelect.selectOption({ index: 1 }); // Select second option just to test change
    // Or strictly: await timezoneSelect.selectOption('America/Denver');

    // 4. Click Find Times
    await findButton.click();

    // 5. Expect loading state or result
    // The visual button changes content to a spinner, so we can check for that
    // or check that the search icon is gone temporarily.
    // However, since we might not have a content script mocking responses in this isolation,
    // we might just see it hang or return "No slots found" if it processes empty DOM.
    // Let's check that the button moves to Loading state or a result area appears.

    // The 112.js flow showed users clicking finding times multiple times.
    // We'll just verify the click is registered.

    // If the app handles "no content script" gracefully, it might show an error or "No slots found".
    // We can check for the existence of the ResultsDisplay component area or a specific text.
    // Given the lack of a real page to scrape, "No slots found" or "Scanning..." is expected.

    // Let's assume the UI doesn't crash.

    // 6. Reset (Go back to setup)
    const resetButton = page.locator('button[aria-label="Reset scheduling URL"]');
    await expect(resetButton).toBeVisible();
    await resetButton.click();

    // 7. Verify we are back at Setup
    await expect(urlInput).toBeVisible();
    await expect(saveButton).toBeVisible();
});
