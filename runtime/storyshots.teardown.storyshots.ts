import { test as setup } from '@playwright/test';
import { completeStoryshots } from './updateLog.js';

setup('storyshots teardown', async ({ page }) => {
    await completeStoryshots()
    await page.waitForTimeout(2000) // wait for the logger to finish writing results
})