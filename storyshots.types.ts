export class StorybookStory {
    title: string
    target: boolean
    ignore: boolean
    
    constructor(title: string, target: boolean) {
        this.title = title
        this.target = target
        this.ignore = false
    }

    static fromString(title: string): StorybookStory {
        return new StorybookStory(title, title.includes('storyshots-target-'))
    }

    get storyshot (): string {
        return `${this.title.replace('storyshots-target-', '')}.jpeg`
    }

    get url (): string {
        return `/iframe.html?viewMode=story&id=${this.title}`
    }
}