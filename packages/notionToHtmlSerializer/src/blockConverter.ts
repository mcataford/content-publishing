import { Block, IParagraphBlock, IRichTextFragment } from './types'

function applyAnnotations(
    text: string,
    annotations: IRichTextFragment['annotations'],
): string {
    let annotatedText = text

    if (annotations.bold) annotatedText = `<strong>${annotatedText}</strong>`
    if (annotations.italic) annotatedText = `<em>${annotatedText}</em>`
    if (annotations.strikethrough) annotatedText = `<s>${annotatedText}</s>`
    if (annotations.underline) annotatedText = `<u>${annotatedText}</u>`
    if (annotations.code) annotatedText = `<code>${annotatedText}</code>`

    return annotatedText
}

/*
 * Serializes a single paragraph block and returns the HTML
 * markup corresponding to the sum of its fragments as a string.
 */
function serializeParagraph(paragraphBlock: IParagraphBlock): string {
    const richTextFragments = paragraphBlock.paragraph.rich_text

    const serializedFragments = richTextFragments.map((fragment) => {
        const annotatedText = applyAnnotations(
            fragment.text.content,
            fragment.annotations,
        )

        if (fragment.href !== null)
            return `<a href="${fragment.href}">${annotatedText}</a>`
        else return `${annotatedText}`
    })

    return `<p>${serializedFragments.join('')}</p>`
}

export function serializeBlock(block: Block): string {
    if (block.type === 'paragraph')
        return serializeParagraph(block as IParagraphBlock)

    return ''
}
