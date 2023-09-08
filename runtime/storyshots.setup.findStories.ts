import { test as setup } from '@playwright/test';
import { startLogger } from './updateLog.js';

setup('findStories setup', async () => {
    await startLogger()
})