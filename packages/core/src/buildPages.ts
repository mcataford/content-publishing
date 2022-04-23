import { promises as fs } from 'fs'

import { IPage, IPageMetadata } from '@content-publishing/types'
import { Client } from '@notionhq/client'
import {
    Block,
    IMultiselectProperty,
    IPageBlock,
    IRichTextProperty,
    serializeBlock,
} from 'notionToHTMLSerializer'

import getLogger from './logging'
/*
 * Gathers context from the environment and prepares an authenticated
 * Notion client for reuse.
 */
function getContext() {
    const notionClient = new Client({ auth: process.env.NOTION_TOKEN })

    return {
        databaseId: process.env.NOTION_DATABASE_ID ?? '',
        notionClient,
        basePath: `${process.cwd()}/site`,
        logger: getLogger(process.stdout),
    }
}

async function preparePage(
    context: ReturnType<typeof getContext>,
    pageMetadata: IPageMetadata,
): Promise<IPage> {
    const queryResponse = await context.notionClient.blocks.children.list({
        block_id: pageMetadata.id,
    })
    const fetchedBlocks = queryResponse.results as Array<Block>

    return {
        slug: pageMetadata.slug, //FIXME: The slug should be passed from the DB pull.
        id: pageMetadata.id,
        html: fetchedBlocks.map(serializeBlock).join(''),
    }
}

/*
 * Gathers the published pages to build HTML pages for.
 */
async function preparePages(
    context: ReturnType<typeof getContext>,
): Promise<Array<IPage>> {
    context.logger.group('Preparing pages')
    const queryResponse = await context.notionClient.databases.query({
        database_id: context.databaseId,
        filter: {
            property: 'Public',
            checkbox: {
                equals: true,
            },
        },
        sorts: [
            {
                property: 'Published on',
                direction: 'ascending',
            },
        ],
    })

    const fetchedBlocks = queryResponse.results as Array<IPageBlock>
    context.logger.log(`Fetched ${fetchedBlocks.length} pages from Notion`)
    const pagesMetadata = fetchedBlocks.map((queryResult) => {
        const tags = queryResult.properties.Tags as IMultiselectProperty
        const slug = queryResult.properties.Slug as IRichTextProperty

        return {
            id: queryResult.id,
            // Assuming that tags are not annotated.
            slug: slug.rich_text[0].text.content,
            tags: tags.multi_select.map(
                (tag: typeof tags['multi_select'][number]) => tag.name,
            ),
        }
    })

    const preparedPages = await Promise.all(
        pagesMetadata.map((pageMetadata) => preparePage(context, pageMetadata)),
    )

    context.logger.log(`Processed ${preparedPages.length} pages`)
    context.logger.groupEnd()

    return preparedPages
}

/*
 * WHen executed, this script pulls all published pages from the Notion DB
 * identified by the NOTION_DATABASE_ID environment variable and assembles
 * HTML pages from their blocks. The pages are then written to disk.
 *
 * This expects that NOTION_TOKEN is present in the environment and contains
 * a valid Notion API auth token.
 */
;(async () => {
    const context = getContext()
    context.logger.group('Building site')
    const pages = await preparePages(context)

    context.logger.group('Writing pages')

    await fs.mkdir(context.basePath, { recursive: true })
    await Promise.all(
        pages.map((page) => {
            const path = `${context.basePath}/${page.slug}.html`
            fs.writeFile(path, page.html)
            context.logger.log(`Wrote ${path}`)
        }),
    )
    context.logger.groupEnd()
    context.logger.groupEnd()
})()
