import { storyshotsEnv } from "./storyshots.env.js"
import { executionContext } from "./storyshots.executionContext.js"
import axios from 'axios'

axios.defaults.headers.post['Content-Type'] = 'application/json'

interface Log {
    start: () => Promise<void>
    waiting: (log?: string) => Promise<void>
    success: () => Promise<void>
    failure: (log?: string) => Promise<void>
    thrown: (reason: string) => Promise<void>
    skipped: (log?: string) => Promise<void>
    unknown: (log?: string) => Promise<void>
}

export const startLogger = async () => {
    const env = storyshotsEnv()
    await axios.post('http://localhost:3000/start', {
        configuration: {
            maxDiffPixelRatio: env.maxDiffPixelRatio,
            waitForStableMillis: env.waitForStableMillis,
            localFilePath: env.localFilePath,
            localBaselinesDir: env.localBaselinesDir,
        }
    })
}

export const startStoryshots = async () => {
    const { getStories } = executionContext()
    const stories = getStories()
    await axios.post('http://localhost:3000/test/start', {
        storyCount: stories.length
    })
}

export const completeStoryshots = async () => {
    await axios.post('http://localhost:3000/test/complete')
}


export const startLogging = (story: string, linkRoot: string): Log => {

    const send = async (status: 'start' | 'waiting' | 'success' | 'unknown' | 'failure' | 'thrown' | 'skipped', log: string) => {
        return axios.post('http://localhost:3000/log', {
            story,
            status,
            log,
            linkRoot,
        })
    }

    const start = async () => {
        await send('start', '')
    }

    const waiting = async (log?: string) => {
        await send('waiting', log ?? '')
    }

    const success = async () => {
        await send('success', '')
    }

    const unknown = async (log?: string) => {
        await send('unknown', log ?? '')
    }

    const failure = async (log?: string) => {
        await send('failure', log ?? '')
    }

    const thrown = async (reason: string) => {
        await send('thrown', reason)
    }

    const skipped = async (log?: string) => {
        await send('skipped', log ?? '')
    }

    return {
        start,
        waiting,
        success,
        failure,
        thrown,
        unknown,
        skipped
    }
}