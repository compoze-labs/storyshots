// create a server that takes a request and logs the body of the request to the console

import express from 'express'
import bodyParser from 'body-parser'
import UpdateManager from 'stdout-update'
import chalk from 'chalk'

const app = express()
app.use(bodyParser.json())

const manager = UpdateManager.getInstance()
manager.hook();

interface Config {
    maxDiffPixelRatio: number
    waitForStableMillis: number
    localFilePath: string
    localBaselinesDir: string
}
let config: Config | undefined = undefined
interface TestStatus {
    storyCount: number
}
let testStatus: TestStatus | undefined = undefined
interface StoryLog {
    status: Status
    log: string
    linkRoot: string
}
type Status = 'start' | 'waiting' | 'success' | 'failure' | 'thrown' | 'skipped' | 'unknown'
const stories = new Map<string, StoryLog>()
let isComplete = false
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let ticks = 0

const createConfigString = (config: Config): string[] => {
    const configuration = config ? `  Configuration:` : '  Configuration: (waiting for configuration)'
    const localFilePath = config.localFilePath ? chalk.grey(`    file: ${config.localFilePath}`) : ''
    const maxDiffPixelRatio = config.maxDiffPixelRatio ? chalk.grey(`    maxDiffPixelRatio: ${config.maxDiffPixelRatio}`) : ''
    const waitForStableMillis = config.waitForStableMillis ? chalk.grey(`    waitForStableMillis: ${config.waitForStableMillis}`) : ''
    return [configuration, localFilePath, maxDiffPixelRatio, waitForStableMillis]
}

const createStatusString = (): string[] => {
    const frame = frames[(ticks = ++ticks % frames.length)];
    if (testStatus === undefined) {
        return [chalk.bold(`${frame} Looking for stories...`)]
    }

    const storiesCompleted = Array.from(stories.entries()).filter(([_, { status }]) => status !== 'start' && status !== 'waiting').length

    if (isComplete) {
        return [chalk.bold(`Completed: (${storiesCompleted}/${testStatus?.storyCount})`)]
    }
    const status = `${frame} Running: (${storiesCompleted}/${testStatus?.storyCount})`
    return [chalk.bold(status)]
}

const failedStoryStringWithLinks = (storyEntry: [string, StoryLog]): string[] => {
    const [story, { status, log, linkRoot }] = storyEntry
    const reason = []

    if (status === 'failure') {
        if (log) {
            reason.push(`          ${chalk.grey(log)}`)
        }

        const actualLink = `          ${chalk.grey('Actual:')} ${chalk.grey(`${linkRoot}/actual.jpeg`)}`
        const expectedLink = `          ${chalk.grey('Expected:')} ${chalk.grey(`${linkRoot}/expected.jpeg`)}`
        const diffLink = `          ${chalk.grey('Diff:')} ${chalk.grey(`${linkRoot}/diff.jpeg`)}`

        reason.push(actualLink, expectedLink, diffLink)

    } else if (status === 'thrown') {
        const padded = log.split('\n').map((line) => `          ${line}`).join('\n')
        const screenshot = `          ${chalk.grey('Screen:')} ${chalk.grey(`${linkRoot}/error.jpeg`)}`
        const consoleLogs = `          ${chalk.grey('Logs:')} ${chalk.grey(`${linkRoot}/error.log`)}`

        reason.push(chalk.grey(padded), screenshot, consoleLogs)
    }

    return [
        `      ${chalk.red(story)}`,
        ...reason
    ]
}

const storyBaselineAltered = (storyEntry: [string, StoryLog]): string[] => {
    const [story] = storyEntry
    
    const link = `${chalk.grey(`${config.localBaselinesDir}/${story}`)}`
    return [
        `      ${chalk.yellow(story)} (${link})`,
    ]
}

const createResultString = (): string[] => {
    const storiesCompleted = Array.from(stories.entries()).filter(([_, { status }]) => status !== 'start' && status !== 'waiting')
    const storiesFailed = Array.from(stories.entries()).filter(([_, { status }]) => status === 'failure' || status === 'thrown')
    const storiesSkipped = Array.from(stories.entries()).filter(([_, { status }]) => status === 'skipped')
    const storiesUnknown = Array.from(stories.entries()).filter(([_, { status }]) => status === 'unknown')
    const storiesPassed = storiesCompleted.length - storiesFailed.length - storiesSkipped.length - storiesUnknown.length
    
    let unknownString = []
    if (storiesUnknown.length > 0) {
        unknownString = [
            chalk.bold.yellow(`    Baselines altered: ${storiesUnknown}`),
            ...storiesUnknown.flatMap(storyBaselineAltered)
        ]
    }
    let failedString = []
    if (storiesFailed.length > 0) {
        failedString = [
            '\n',
            chalk.bold.red(`    Failed stories:`),
            ...storiesFailed.flatMap(failedStoryStringWithLinks)
        ]
    }
    return [
        chalk.bold(`\nSummary:`),
        chalk.bold(`    Stories: ${storiesCompleted.length}`),
        chalk.bold.green(`    Passed: ${storiesPassed}`),
        ...(storiesFailed.length > 0 ? [chalk.bold.red(`    Failed: ${storiesFailed.length}`)] : []),
        chalk.bold.grey(`    Skipped: ${storiesSkipped.length}`),
        ...unknownString,
        ...failedString
    ]
}

setInterval(() => {
    const title = chalk.bold('Storyshots')
    
    const configString = config ? createConfigString(config) : []

    const logs = Array.from(stories.entries()).map(([story, { status, log }]) => {
        const appendedLog = log ? ` (${log})` : ''
        switch (status) {
            case 'start':
                return `  🔘 ${story}${appendedLog}`
            case 'waiting':
                return `  ⏳ ${story}${appendedLog}`
            case 'success':
                return `  ✅ ${story}${appendedLog}`
            case 'failure':
                return `  ❌ ${story}`
            case 'thrown':
                return `  ❌ ${story} (threw error)`
            case 'unknown':
                return `  ❓ ${story}${appendedLog}`
            case 'skipped':
                return `  💤 ${story}${appendedLog}`
        }
    })
    manager.update([
        title, 
        ...configString, 
        '\n',
        ...createStatusString(), 
        ...logs,
        ...(isComplete ? createResultString() : []),
    ], 0)
}, 100)

interface LogBody {
    story: string
    log: string
    status: Status,
    linkRoot: string
}
app.post('/log', (req, res) => {
    const body = req.body as LogBody
    stories.set(body.story, {
        status: body.status,
        log: body.log,
        linkRoot: body.linkRoot,
    })
    res.sendStatus(200)
})

interface StartRequest {
    configuration: Config
}
app.post('/start', (req, res) => {
    const body = req.body as StartRequest
    config = body.configuration
    res.sendStatus(200)
})

app.post('/test/start', (req, res) => {
    const body = req.body as TestStatus
    testStatus = body
    res.sendStatus(200)
})

app.post('/test/complete', (req, res) => {
    isComplete = true
    res.sendStatus(200)
})

process.once('SIGTERM', () => {
    manager.unhook(false);
    process.exit(0)
})

app.listen(3000)
