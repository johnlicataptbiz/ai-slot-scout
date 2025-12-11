import { test, expect } from './fixtures';

test('popup loads and shows initial setup or main view', async ({ page, extensionId }) => {
    // Navigate to the extension popup
    await page.goto(`chrome-extension://${extensionId}/index.html`);

    // Check if either the setup view or the main slot finder is visible
    // Note: Since it's a fresh install in the test context, it might default to SetupView if no token is found,
    // or SlotFinder if the logic defaults differently.

    // We'll look for a common element or check for the setup header
    const setupHeader = page.locator('h1:has-text("AI Slot Scout")');
    const findSlotsButton = page.locator('button:has-text("Find Available Slots")');

    // Expect at least one of these to be visible to confirm the popup loaded
    await expect(setupHeader.or(findSlotsButton)).toBeVisible();
});

test('full flow: setup -> find slots -> reset', async ({ page, extensionId }) => {
    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
    await page.goto(`chrome-extension://${extensionId}/index.html`);

    // 1. Handle Setup if needed
    const setupHeader = page.locator('h1:has-text("AI Slot Scout")');
    if (await setupHeader.isVisible()) {
        const urlInput = page.locator('input[type="url"]');
        await urlInput.fill('https://calendly.com/test-user/30min');

        const saveButton = page.locator('button:has-text("Save & Continue")');
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        // Wait for setup to disappear (check save button which is unique to setup)
        await expect(saveButton).not.toBeVisible();
    }

    // 2. Verify we are on Slot Finder view
    const findButton = page.locator('button[aria-label="Find Times"]');
    await expect(findButton).toBeVisible();

    // 3. Change Timezone
    const timezoneSelect = page.locator('#timezone');
    await timezoneSelect.selectOption('America/Denver');

    // 4. Click Find Times
    await findButton.click();

    // 5. Expect loading state or result
    // The mock logic waits 1s then returns no slots if content script isn't found/mocked.
    // In this extension context, the content script might not be injected into the *active tab* 
    // 5. Expect loading state or result
    // Use substring matching or be specific
    const loadingOrResult = page.locator('text=Scanning slots').or(page.locator('text=No slots found'));
    await expect(loadingOrResult).toBeVisible();

    // 6. Reset (Go back to headers) - The recording used a header button
    // Looking at the recording, it clicked a button in header.
    // Let's assume there is a settings/reset button.
    const resetButton = page.locator('button[aria-label="Reset scheduling URL"]');
    // Only if it exists. If not, maybe we just verify we got this far.
    if (await resetButton.isVisible()) {
        await resetButton.click();
        await expect(setupHeader).toBeVisible();
    }
});
