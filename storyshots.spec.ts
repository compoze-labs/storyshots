import { test, expect } from '@playwright/test'
import { storyshotsEnv } from './storyshots.env'
import { testStories } from './storyshots.testStories'
import { testStory } from './storyshots.testStory'

const env = storyshotsEnv()

test.describe.only('visual regressions', () => {
    testStories(env, async (page, storiesList) => {
        let anyStoryFailed = false
        for (const story of storiesList) {
            const succeeded = await testStory(page, story)
            if (!succeeded) {
                anyStoryFailed = true
            }
        }
        expect(anyStoryFailed, "A visual regression did not pass, review the diffs and either update the baselines or fix the issue").toBe(false)
    })
})
