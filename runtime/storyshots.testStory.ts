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
        thrown,
        success,
        waiting,
        skipped,
        unknown
    } = startLogging(storyshot, `${localResultsDir}/${title}`)
    await start()

    const consoleErrors = captureConsoleErrors(page)

    if (ignore) {
        await skipped("skipped by config")
        return true
    }

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        await waitForStoryReady(page)

        if (waitForStableMillis > 0) {
            await waitForStable(page, waitForStableMillis, waiting)
        }

        const {
            storyPassed,
            snapshotNotExistant,
            storyPassedButUpdated,
        } = await assertMatchingSnapshot(page, storyshot, unknown)

        if (storyPassed) {
            if (snapshotNotExistant) {
                await unknown("no baseline found")
            } else if (!storyPassedButUpdated) {
                await success()
            } else {
                await unknown("baseline updated")
            }
        } else {
            await shortenArtifactNames(title)

            await failure()
        }

        return storyPassed
    } catch (err) {
        const image = await page.screenshot({
            type: 'jpeg',
            animations: 'disabled',
            fullPage: true,
        })

        fs.mkdirSync(`/storyshots/test-results/${title}`, { recursive: true })
        fs.writeFileSync(`/storyshots/test-results/${title}/error.jpeg`, image)
        fs.writeFileSync(`/storyshots/test-results/${title}/error.log`, consoleErrors.dump())

        await thrown(err.message ?? err)
        return false
    }
}

async function waitForStoryReady(page: Page) {
    try {
        await page.locator('#storybook-root > *:first-child')
            .waitFor({ state: 'attached', timeout: 30 * 1000 })
    } catch (err) {
        throw new Error('Story did not mount in time.')
    }
}

// continually take screenshots until the page is stable (i.e. no more animations)
async function waitForStable(page: Page, waitForStableMillis: number, waiting: (message: string) => Promise<void>) {
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

async function assertMatchingSnapshot(page: Page, storyshot: string, unknown: (message: string) => Promise<void>) {
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

    return {
        storyPassed,
        snapshotNotExistant,
        storyPassedButUpdated,
    }
}

async function shortenArtifactNames(title: string) {
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
}

function captureConsoleErrors(page: Page) {
    const errors: string[] = []

    page.on('console', async (msg) => {
        if (msg.type() === 'error') {
            errors.push(msg.text())
        }
    })

    return {
        dump: () => errors.join('\n'),
    }
}
