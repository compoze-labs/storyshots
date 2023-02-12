import { expect, Page } from "@playwright/test"
import { StorybookStory } from "./storyshots.types"

export async function testStory(page: Page, { storyshot, url }: StorybookStory): Promise<Boolean> {
    await page.goto(url, { waitUntil: 'domcontentloaded' })

    const image = await page.screenshot({
        type: 'jpeg',
        animations: 'disabled',
        fullPage: true,
    })

    let storyPassed = true
    try {
        expect(image).toMatchSnapshot(storyshot, {
            maxDiffPixelRatio: 0,
        })
    } catch (err) {
        storyPassed = false
    }
    if (storyPassed) {
        console.log(`✅ ${storyshot}`)
    } else {
        console.log(`❌ ${storyshot}`)
    }
    return storyPassed
}