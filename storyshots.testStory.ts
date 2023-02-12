import { expect, Page } from "@playwright/test"
import { StorybookStory } from "./storyshots.types"

export async function testStory(page: Page, { title }: StorybookStory): Promise<Boolean> {
    await page.goto(
        `/iframe.html?viewMode=story&id=${title}`,
        { waitUntil: 'domcontentloaded' }
    )

    const image = await page.screenshot({
        type: 'jpeg',
        animations: 'disabled',
        fullPage: true,
    })

    let storyPassed = true
    try {
        expect(image).toMatchSnapshot(`${title}.jpeg`, {
            maxDiffPixelRatio: 0,
        })
    } catch (err) {
        storyPassed = false
    }
    if (storyPassed) {
        console.log(`✅ ${title}`)
    } else {
        console.log(`❌ ${title}`)
    }
    return storyPassed
}