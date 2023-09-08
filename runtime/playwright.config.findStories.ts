import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

/** 
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    testDir: '/storyshots',
    testMatch: /storyshots.findStories.ts/i,
    snapshotPathTemplate: '/storyshots/storyshots/{arg}{ext}',
    timeout: 5 * 60 * 1000,
    expect: {
        timeout: 5000,
    },
    retries: 0,
    workers: 1,
    reporter: [['html', { open: 'never' }]],
    use: {
        screenshot: 'off',
        headless: true,
        baseURL: process.env.STORYBOOK_URL,
    },
    projects: [
        {
            name: 'setup',
            testMatch: /storyshots\.setup\.findStories\.js/i,
            fullyParallel: false
        },
        {
            name: 'chromium',
            dependencies: ['setup'],
            use: {
                ...devices['Desktop Chrome'],
                ignoreHTTPSErrors: true,
            },
        },
    ],
}

export default config
