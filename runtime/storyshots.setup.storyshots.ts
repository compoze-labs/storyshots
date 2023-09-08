import { test as setup } from '@playwright/test';
import { startStoryshots } from './updateLog.js';

setup('storyshots setup', async () => {
    await startStoryshots()
})