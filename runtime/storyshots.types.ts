export class StorybookStory {
    title: string
    target: boolean
    ignore: boolean
    
    constructor(title: string, target: boolean, ignore = false) {
        this.title = title
        this.target = target
        this.ignore = ignore
    }

    static fromString(title: string): StorybookStory {
        return new StorybookStory(title, title.includes('storyshots-target-'))
    }

    get storyshot (): string {
        return `${this.title.replace('storyshots-target-', '')}`
    }

    get url (): string {
        return `/iframe.html?viewMode=story&id=${this.title}`
    }
}