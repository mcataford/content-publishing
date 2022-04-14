import { Block, serializeBlock } from '.'

function getMockBlock(): Block {
    return {
        object: 'block',
        id: 'c5fdb7d4-c29e-4662-abea-5221141ddef6',
        created_time: '2022-04-15T02:45:00.000Z',
        last_edited_time: '2022-04-15T04:02:00.000Z',
        created_by: {
            object: 'user',
            id: '57164243-a51f-455a-9e74-979fe64d8729',
        },
        last_edited_by: {
            object: 'user',
            id: '57164243-a51f-455a-9e74-979fe64d8729',
        },
        has_children: false,
        archived: false,
        type: 'paragraph',
        paragraph: {
            rich_text: [
                {
                    type: 'text',
                    text: {
                        content: 'text!',
                        link: null,
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: 'default',
                    },
                    plain_text: 'text!',
                    href: null,
                },
            ],
            color: 'default',
        },
    }
}

describe('Paragraph block serialization', () => {
    describe('Fragments', () => {
        it('Links', () => {
            const mockUrl = 'https://website.com'
            const blockWithLink = getMockBlock()
            blockWithLink.paragraph.rich_text[0].text.link = { url: mockUrl }
            blockWithLink.paragraph.rich_text[0].href = mockUrl
            expect(serializeBlock(blockWithLink)).toEqual(
                `<p><a href="${mockUrl}">${blockWithLink.paragraph.rich_text[0].plain_text}</a></p>`,
            )
        })

        it.each`
            annotation         | bold     | italic   | strikethrough | underline | code     | expectation
            ${'Bold'}          | ${true}  | ${false} | ${false}      | ${false}  | ${false} | ${'<strong>text!</strong>'}
            ${'Italic'}        | ${false} | ${true}  | ${false}      | ${false}  | ${false} | ${'<em>text!</em>'}
            ${'Strikethrough'} | ${false} | ${false} | ${true}       | ${false}  | ${false} | ${'<s>text!</s>'}
            ${'Underline'}     | ${false} | ${false} | ${false}      | ${true}   | ${false} | ${'<u>text!</u>'}
            ${'Code'}          | ${false} | ${false} | ${false}      | ${false}  | ${true}  | ${'<code>text!</code>'}
        `(
            '$annotation',
            ({ bold, italic, strikethrough, underline, code, expectation }) => {
                const blockWithLink = getMockBlock()
                blockWithLink.paragraph.rich_text[0].annotations = {
                    bold,
                    italic,
                    strikethrough,
                    underline,
                    code,
                    color: 'default',
                }
                expect(serializeBlock(blockWithLink)).toEqual(
                    `<p>${expectation}</p>`,
                )
            },
        )
    })
})
