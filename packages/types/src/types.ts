export interface IPage {
    html: string
    slug: string
    id: string
}

export interface IPageMetadata {
    id: string
    slug: string
    tags: Array<string>
}
