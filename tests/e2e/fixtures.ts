import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

export const test = base.extend<{
    context: BrowserContext;
    extensionId: string;
}>({
    context: async ({ }, use) => {
        const pathToExtension = path.join(__dirname, '../../dist');
        const context = await chromium.launchPersistentContext('', {
            headless: false,
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
            ],
        });
        await use(context);
        await context.close();
    },
    extensionId: async ({ context }, use) => {
        // Since we don't have a background service worker, we grab the ID from chrome://extensions
        const page = await context.newPage();
        await page.goto('chrome://extensions');

        // Enable developer mode if needed, though usually IDs are visible.
        // The ID is usually in a simpler element in the shadow DOM or standard DOM depending on version.
        // A reliable way is to evaluate script on the page to find our extension.

        const extensionId = await page.evaluate(() => {
            // @ts-ignore
            const items = document.getElementsByTagName('extensions-manager')[0]
                .shadowRoot.getElementById('items-list')
                .shadowRoot.querySelectorAll('extensions-item');

            for (const item of items) {
                // @ts-ignore
                if (item.shadowRoot.textContent.includes('AI Slot Scout')) {
                    return item.id;
                }
            }
            return null;
        });

        await page.close();

        if (!extensionId) {
            throw new Error('Could not find Extension ID on chrome://extensions page');
        }

        await use(extensionId);
    },
});
export const expect = base.expect;
