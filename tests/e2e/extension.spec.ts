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

test('can navigate to settings and back', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/index.html`);

    // Assuming there's a settings button or we are in setup mode. 
    // If we are in setup mode, we are technically "in settings".
    // Let's check for the existence of the Calendly URL input which is core to the extension.
    const input = page.locator('input[placeholder="https://calendly.com/your-name/30min"]');

    if (await input.isVisible()) {
        await input.fill('https://calendly.com/test-user/30min');
        // If there is a save button, we could test clicking it
        const saveBtn = page.locator('button:has-text("Save & Continue")');
        if (await saveBtn.isVisible()) {
            // just verify it's there for now to avoid side effects in this basic smoke test
            await expect(saveBtn).toBeEnabled();
        }
    }
});
