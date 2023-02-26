import { writeFile } from 'fs/promises'
import { readFileSync } from 'fs'
import { StorybookStory } from './storyshots.types'

export class ExecutionContext {
    setStories = async (storiesList: StorybookStory[]) => {
        return writeFile(
            'stories.json',
            JSON.stringify(storiesList),
            { encoding: 'utf8' }
        )
    }
    
    getStories = (): StorybookStory[] => {
        const stories = readFileSync('stories.json', { encoding: 'utf8' })
        return JSON.parse(stories)
            .map((it) => new StorybookStory(it.title, it.target, it.ignore))
    }
}

export const executionContext = () => new ExecutionContext()
