import { test } from '@playwright/test'
import { testStories } from './storyshots.testStories'
import * as fs from 'fs/promises'
import { storyshotsEnv } from './storyshots.env'

const env = storyshotsEnv()

test.describe.only('find stories to test', () => {
    testStories(env, async (page, storiesList) => {
        console.log(`${storiesList.length} stories to test`)
        if (env.listStories) {
            storiesList.forEach((story) => {
                console.log(`🔘 ${story.title}`)
            })
        }

        return fs.writeFile(
            'stories.json',
            JSON.stringify(storiesList, null, 2),
            { encoding: 'utf8' }
        )
    })
})
