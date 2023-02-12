import { Page, test } from '@playwright/test'

export interface StorybookStory {
    title: string
}

export function testStories(testFunc: (page: Page, stories: StorybookStory[]) => Promise<void>) {
    test('specs', async ({ page }, testConfig) => {
        testConfig.snapshotSuffix = ''
        
        await page.goto('/', {
            waitUntil: 'domcontentloaded',
        })
        await page.waitForSelector(
            '[data-nodetype=component], [data-nodetype=group]'
        )

        const components = page.locator(
            '[data-nodetype=component], [data-nodetype=group]'
        )
        let i = 0
        while (i < (await components.count())) {
            const currentComponent = page
                .locator('[data-nodetype=component], [data-nodetype=group]')
                .nth(i)
            await currentComponent.click()
            i++
        }

        const stories = page.locator('[data-nodetype=story]')
        const storiesCount = await stories.count()
        const storiesList: StorybookStory[] = []
        for (let j = 0; j < storiesCount; j++) {
            const currentStory = stories.nth(j)
            const title = await currentStory.getAttribute('data-item-id')
            if (title) {
                storiesList.push({
                    title,
                })
            }
        }

        await testFunc(page, storiesList)
    })
}