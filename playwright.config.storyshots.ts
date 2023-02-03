import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

/** 
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    testDir: '/storyshots',
    testMatch: /storyshots.spec.ts/i,
    timeout: 120 * 1000,
    expect: {
        timeout: 5000,
    },
    retries: 0,
    workers: 1,
    reporter: [['html', { open: 'never' }]],
    use: {
        screenshot: 'off',
        headless: true,
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
