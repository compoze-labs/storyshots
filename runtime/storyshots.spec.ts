import { test, expect } from '@playwright/test'
import { executionContext } from './storyshots.executionContext.js';
import { testStory } from './storyshots.testStory.js';

const context = executionContext()

test.describe.configure({ mode: 'parallel' });

test.describe.only('visual regressions', () => {
    const stories = context.getStories()
    
    stories.forEach((story) => {
        test(story.title, async ({ page }, testConfig) => {
            testConfig.snapshotSuffix = ''
            const succeeded = await testStory(page, story)
            
            expect(succeeded).toBe(true)
        })
    })
})
