import { Page, test } from '@playwright/test'
import { StoryshotsEnvironment } from './storyshots.env'
import { StorybookStory } from './storyshots.types'

export function testStories(env: StoryshotsEnvironment, testFunc: (page: Page, stories: StorybookStory[]) => Promise<void>) {
    const { singleStory, ignoreStories } = env

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
        ' [data-nodetype=component]'
    )

    const closedComponents = page.locator(
        '[data-nodetype=component][aria-expanded=false]'
    )
    let closedComponentsCount = await closedComponents.count()
    while (closedComponentsCount > 0) {
        await closedComponents.nth(0).click()
        closedComponentsCount = await closedComponents.count()
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