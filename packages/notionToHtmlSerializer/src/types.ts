export interface IBlockPropertyBase {
    id: string
    type: string
}

export interface IRichTextProperty extends IBlockPropertyBase {
    type: 'rich_text'
    rich_text: Array<IRichTextFragment>
}

export interface ICheckboxProperty extends IBlockPropertyBase {
    type: 'checkbox'
    checkbox: boolean
}

export interface IMultiselectProperty extends IBlockPropertyBase {
    type: 'multi_select'
    multi_select: Array<{
        id: string
        name: string
        color: string
    }>
}

export type BlockProperty =
    | IRichTextProperty
    | ICheckboxProperty
    | IMultiselectProperty

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

export interface IGenericBlock {
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

export interface IParagraphBlock extends IGenericBlock {
    type: 'paragraph'
    object: 'block'
}

export interface IPageBlock extends IGenericBlock {
    object: 'page'
    properties: {
        [key: string]:
            | IRichTextProperty
            | ICheckboxProperty
            | IMultiselectProperty
    }
}

export type Block = IParagraphBlock
