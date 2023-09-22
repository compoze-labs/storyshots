import { Page, test } from '@playwright/test'
import { StorybookStory } from './storyshots.types.js'
import { StoryshotsEnvironment } from './storyshots.env.js'

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

interface StorybookIndexResponse {
    v: number
    entries: Record<string, {
        id: string
        type: 'story'
        name: string
        title: string
        importPath: string
        tags: string[]
    }>
}

async function getStoriesList(page: Page): Promise<StorybookStory[]> {
    const stoybookIndexResponse = await fetch(`${page.url()}/index.json`)
        .then((res) => res.json()) as StorybookIndexResponse

    return Object.entries(stoybookIndexResponse.entries).filter(([, value]) => {
        return value.type === 'story'
    }).map(([, value]) => {
        return StorybookStory.fromString(value.id)
    })
}
