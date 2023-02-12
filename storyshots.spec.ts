import { test, expect } from '@playwright/test'
import { testStories } from './storyshots.testStories'
import { testStory } from './storyshots.testStory'

test.describe.only('visual regressions', () => {
    testStories(async (page, storiesList) => {
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
