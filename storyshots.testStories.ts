import { Page, test } from '@playwright/test'
import { storyshotsEnv } from './storyshots.env'
import { StorybookStory } from './storyshots.types'

const { singleStory, ignoreStories } = storyshotsEnv()

export function testStories(testFunc: (page: Page, stories: StorybookStory[]) => Promise<void>) {
    test('specs', async ({ page }, testConfig) => {
        testConfig.snapshotSuffix = ''
        
        await page.goto('/', {
            waitUntil: 'domcontentloaded',
        })

        const storiesList: StorybookStory[] = []
        if (singleStory) {
            storiesList.push(singleStory)
        } else {
            const stories = await getStoriesList(page)
            const targets = stories.filter((story) => story.target)
            if (targets.length > 0) {
                storiesList.push(...targets)
            } else {
                storiesList.push(...stories)
            }
        }

        // set the ignore flag on all stories that are ignored
        storiesList.forEach((story) => {
            if (ignoreStories.find((ignoreStory) => ignoreStory.title === story.title)) {
                story.ignore = true
            }
        })

        await testFunc(page, storiesList)
    })
}

async function getStoriesList(page: Page): Promise<StorybookStory[]> {
    const storiesList: StorybookStory[] = []

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
    for (let j = 0; j < storiesCount; j++) {
        const currentStory = stories.nth(j)
        const title = await currentStory.getAttribute('data-item-id')
        if (title) {
            storiesList.push(StorybookStory.fromString(title))
        }
    }

    return storiesList
}