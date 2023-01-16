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

        let anyStoryFailed = false
        for (const story of storiesList) {
            await page.goto(
                `http://storybook-server:80/iframe.html?viewMode=story&id=${story}`,
                { waitUntil: 'domcontentloaded' }
            )

            const image = await page.screenshot({
                type: 'jpeg',
                animations: 'disabled',
                fullPage: true,
            })

            let storyFailed = false
            try {
                expect(image).toMatchSnapshot(`${story}.jpeg`, {
                    maxDiffPixelRatio: 0,
                })
            } catch (err) {
                storyFailed = true
                anyStoryFailed = true
            }
            if (storyFailed) {
                console.log(`❌ ${story}`)
            } else {
                console.log(`✅ ${story}`)
            }
        }
        expect(anyStoryFailed, "A visual regression did not pass, review the diffs and either update the baselines or fix the issue").toBe(false)
    })
})
