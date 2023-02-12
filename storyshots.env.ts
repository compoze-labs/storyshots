import { StorybookStory } from "./storyshots.types"

export interface StoryshotsEnvironment {
    singleStory?: StorybookStory
}

export function storyshotsEnv(): StoryshotsEnvironment {
    const env: StoryshotsEnvironment = {
        singleStory: undefined,
    }
    if (process.env.STORYSHOTS_STORY) {
        env.singleStory = StorybookStory.fromString(process.env.STORYSHOTS_STORY)
    }
    return env
}