import { test } from '@playwright/test'
import { testStories } from './storyshots.testStories'
import { storyshotsEnv } from './storyshots.env'
import { executionContext } from './storyshots.executionContext'

const env = storyshotsEnv()
const context = executionContext()

test.describe.only('find stories to test', () => {
    testStories(env, async (page, storiesList) => {
        console.log(`${storiesList.length} stories to test`)
        if (env.listStories) {
            storiesList.forEach((story) => {
                console.log(`🔘 ${story.title}`)
            })
        }

        return context.setStories(storiesList)
    })
})
