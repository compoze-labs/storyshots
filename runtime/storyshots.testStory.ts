import { expect, Page } from "@playwright/test"
import { StorybookStory } from "./storyshots.types.js";
import { storyshotsEnv } from "./storyshots.env.js";
import { startLogging } from "./updateLog.js";
import fs from 'fs'

const {
    maxDiffPixelRatio,
    waitForStableMillis,
    localResultsDir
} = storyshotsEnv()

export async function testStory(page: Page, { storyshot, url, ignore, title }: StorybookStory): Promise<Boolean> {
    const {
        start,
        failure,
        success,
        waiting,
        skipped,
        unknown
    } = startLogging(storyshot)
    await start()

    if (ignore) {
        await skipped("skipped by config")
        return true
    }

    await page.goto(url, { waitUntil: 'domcontentloaded' })

    // continually take screenshots until the page is stable (i.e. no more animations)
    if (waitForStableMillis > 0) {
        let stable = false
        let elapsed = 0
        let lastImage: Buffer | undefined
        await waiting("waiting for stable")
        while (!stable && elapsed < waitForStableMillis) {
            const image = await page.screenshot({
                type: 'jpeg',
                animations: 'disabled',
                fullPage: true,
            })
            if (lastImage) {
                stable = image.equals(lastImage)
            }
            lastImage = image

            if (waitForStableMillis < 1000) {
                await page.waitForTimeout(100)
                elapsed += 100
            } else {
                await page.waitForTimeout(1000)
                elapsed += 1000
            }
            await waiting("waiting for stable")
        }
    }

    let storyPassed = true
    let snapshotNotExistant = false
    let storyPassedButUpdated = false
    try {
        const image = await page.screenshot({
            type: 'jpeg',
            animations: 'disabled',
            fullPage: true,
        })
        
        const filename = `/storyshots/storyshots/${storyshot}.jpeg`
        if (!fs.existsSync(filename)) {
            console.log(`no baseline found for ${storyshot}.jpeg`)
            snapshotNotExistant = true
        } else {
            fs.watch(filename, (event) => {
                if (event === 'change') {
                    storyPassedButUpdated = true
                    unknown("baseline updated")
                }
            })
        }

        expect(image).toMatchSnapshot(`${storyshot}.jpeg`, {
            maxDiffPixelRatio
        })
    } catch (err) {
        storyPassed = false
        console.log({ err })
    }
    if (storyPassed) {
        if (snapshotNotExistant) {
            await unknown("no baseline found")
        } else if (!storyPassedButUpdated) {
            await success()
        } else {
            await unknown("baseline updated")
        }
    } else {
        // rename the subdirectory to be much shorter
        fs.renameSync(
            `/storyshots/test-results/runtime-storyshots-visual-regressions-${title}-chromium`,
            `/storyshots/test-results/${title}`
        )
        fs.renameSync(
            `/storyshots/test-results/${title}/${title}-actual.jpeg`,
            `/storyshots/test-results/${title}/actual.jpeg`,
        )
        fs.renameSync(
            `/storyshots/test-results/${title}/${title}-expected.jpeg`,
            `/storyshots/test-results/${title}/expected.jpeg`,
        )
        fs.renameSync(
            `/storyshots/test-results/${title}/${title}-diff.jpeg`,
            `/storyshots/test-results/${title}/diff.jpeg`,
        )
        await failure(
            `${localResultsDir}/${title}`
        )
    }
    return storyPassed
}