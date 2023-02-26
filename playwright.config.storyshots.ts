import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

/** 
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    testDir: '/storyshots',
    testMatch: /storyshots.spec.ts/i,
    snapshotPathTemplate: '/storyshots/storyshots/{arg}{ext}',
    timeout: 10 * 1000, // should be a static site, so 10s should be plenty
    expect: {
        timeout: 5000,
    },
    retries: 0,
    workers: 4,
    reporter: [['html', { open: 'never' }]],
    use: {
        screenshot: 'off',
        headless: true,
        baseURL: process.env.STORYBOOK_URL,
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                ignoreHTTPSErrors: true,
            },
        },
    ],
}

export default config
