import { test, expect } from '@playwright/test'
import { storyshotsEnv } from './storyshots.env'
import { executionContext } from './storyshots.executionContext'
import { testStories } from './storyshots.testStories'
import { testStory } from './storyshots.testStory'

const env = storyshotsEnv()
const context = executionContext()

test.describe.configure({ mode: 'parallel' });

test.describe.only('visual regressions', async () => {
    const stories = context.getStories()

    stories.forEach((story) => {
        test(story.title, async ({ page }, testConfig) => {
            testConfig.snapshotSuffix = ''
            const succeeded = await testStory(page, story)

            expect(succeeded, `Visual regression for ${story.title} did not pass, review the diffs and either update the baselines or fix the issue`).toBe(true)
        })
    })
})
