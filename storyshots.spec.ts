import { test, expect } from '@playwright/test'

test.describe('our visual regressions', () => {
    test('should match the existing specs', async ({ page }, testConfig) => {
        testConfig.snapshotSuffix = ''

        await page.goto('http://storybook-server:80', {
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
        const storiesList: string[] = []
        for (let j = 0; j < storiesCount; j++) {
            const currentStory = stories.nth(j)
            const title = await currentStory.getAttribute('data-item-id')
            if (title) {
                storiesList.push(title)
            }
        }

        for (const story of storiesList) {
            console.log(story)
            await page.goto(
                `http://storybook-server:80/iframe.html?viewMode=story&id=${story}`,
                { waitUntil: 'domcontentloaded' }
            )

            const image = await page.screenshot({
                type: 'jpeg',
                animations: 'disabled',
                fullPage: true,
            })

            expect(image).toMatchSnapshot(`${story}.jpeg`, {
                maxDiffPixelRatio: 0.1,
            })
        }
    })
})
