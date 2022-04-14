import { promises as fs } from 'fs'

import { serializeBlock, Block } from '@content-publishing/blockSerializer'
import { IPage } from '@content-publishing/types'
import { Client } from '@notionhq/client'

/*
 * Gathers context from the environment and prepares an authenticated
 * Notion client for reuse.
 */
function getContext() {
    const notionClient = new Client({ auth: process.env.NOTION_TOKEN })

    return {
        databaseId: process.env.NOTION_DATABASE_ID ?? '',
        notionClient,
    }
}

async function preparePage(
    context: ReturnType<typeof getContext>,
    pageId: string,
): Promise<IPage> {
    const pageBlocks = await context.notionClient.blocks.children.list({
        block_id: pageId,
    })

    return {
        slug: pageId, //FIXME: The slug should be passed from the DB pull.
        id: pageId,
        html: pageBlocks.results.map((block) => serializeBlock(block as Block)).join(''),
    }
}

/*
 * Gathers the published pages to build HTML pages for.
 */
async function preparePages(
    context: ReturnType<typeof getContext>,
): Promise<Array<IPage>> {
    const queryResult = await context.notionClient.databases.query({
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

    const pageIdsToFetch = queryResult.results.map((queryHit) => queryHit.id)

    const preparedPages = await Promise.all(
        pageIdsToFetch.map((pageId) => preparePage(context, pageId)),
    )

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
    const pages = await preparePages(context)

    // TODO: Filenames should be based on slugs?
    await Promise.all(
        pages.map((page) => fs.writeFile(`${page.slug}.html`, page.html)),
    )
})()
