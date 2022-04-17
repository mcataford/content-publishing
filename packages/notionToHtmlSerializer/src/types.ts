export interface IRichTextFragment {
    type: string
    text: {
        content: string
        link: { url: string } | null
    }
    annotations: {
        bold: boolean
        italic: boolean
        strikethrough: boolean
        underline: boolean
        code: boolean
        color: string
    }
    plain_text: string
    href: string | null
}

export interface IParagraphBlock {
    type: string
    paragraph: {
        rich_text: Array<IRichTextFragment>
        color: string
    }
    archived: boolean
    has_children: boolean
    object: string
    id: string
    last_edited_time: string
    created_time: string
    created_by: {
        object: string
        id: string
    }
    last_edited_by: {
        object: string
        id: string
    }
}

export type Block = IParagraphBlock


