import { fstat } from "fs"
import { StorybookStory } from "./storyshots.types"
import fs from 'fs'

export interface StoryshotsEnvironment {
    singleStory?: StorybookStory
    ignoreStories: StorybookStory[]
    listStories?: boolean
}

interface StoryshotsConfig {
    ignoreStories?: string[]
}

export function storyshotsEnv(): StoryshotsEnvironment {
    const env: StoryshotsEnvironment = {
        singleStory: undefined,
        ignoreStories: [],
        listStories: false,
    }
    if (process.env.STORYSHOTS_STORY) {
        env.singleStory = StorybookStory.fromString(process.env.STORYSHOTS_STORY)
    }

    if (process.env.STORYSHOTS_LIST === 'true') {
        env.listStories = true
    }

    //dynamically import the configuration file from the path '/storyshots/.storyshots.json', if it exists
    const storyshotsConfigPath = '/storyshots/.storyshots.json'
    if (fs.existsSync(storyshotsConfigPath)) {
        const storyshotsConfig = JSON.parse(fs.readFileSync(storyshotsConfigPath, 'utf8')) as StoryshotsConfig
        if (storyshotsConfig.ignoreStories) {
            env.ignoreStories = storyshotsConfig.ignoreStories.map(StorybookStory.fromString)
        }
    }

    return env
}