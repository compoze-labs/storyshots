import { StorybookStory } from "./storyshots.types.js"
import * as fs from 'fs';

export interface StoryshotsEnvironment {
    singleStory?: StorybookStory
    ignoreStories: StorybookStory[]
    listStories?: boolean
    maxDiffPixelRatio: number
    waitForStableMillis: number
    localResultsDir: string
    localBaselinesDir: string
    localFilePath: string
}

interface StoryshotsConfig {
    ignoreStories?: string[]
    maxDiffPixelRatio?: number
    waitForStableMillis?: number
}

export function storyshotsEnv(): StoryshotsEnvironment {
    const env: StoryshotsEnvironment = {
        singleStory: undefined,
        ignoreStories: [],
        listStories: false,
        maxDiffPixelRatio: 0.01,
        waitForStableMillis: 0,
        localResultsDir: '???',
        localBaselinesDir: '???',
        localFilePath: '???',
    }
    if (process.env.STORYSHOTS_STORY) {
        env.singleStory = StorybookStory.fromString(process.env.STORYSHOTS_STORY)
    }

    if (process.env.STORYSHOTS_LIST === 'true') {
        env.listStories = true
    }

    if (process.env.LOCAL_RESULTS_DIR) {
        env.localResultsDir = `${process.env.LOCAL_RESULTS_DIR}/test-results`
    }

    if (process.env.LOCAL_RESULTS_DIR) {
        env.localBaselinesDir = `${process.env.LOCAL_RESULTS_DIR}`
    }

    if (process.env.CONFIG_FILE) {
        env.localFilePath = process.env.CONFIG_FILE
    }

    //dynamically import the configuration file from the path '/storyshots/.storyshots.json', if it exists
    const storyshotsConfigPath = '/storyshots/.storyshots.json'
    if (fs.existsSync(storyshotsConfigPath)) {
        const storyshotsConfig = JSON.parse(fs.readFileSync(storyshotsConfigPath, 'utf8')) as StoryshotsConfig
        if (storyshotsConfig.ignoreStories) {
            env.ignoreStories = storyshotsConfig.ignoreStories.map(StorybookStory.fromString)
        }
        if (storyshotsConfig.maxDiffPixelRatio !== undefined) {
            env.maxDiffPixelRatio = storyshotsConfig.maxDiffPixelRatio
        }
        if (storyshotsConfig.waitForStableMillis !== undefined) {
            env.waitForStableMillis = storyshotsConfig.waitForStableMillis
        }
    }

    return env
}