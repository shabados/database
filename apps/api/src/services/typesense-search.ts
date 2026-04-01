import Typesense from 'typesense'

import type { PangtiSearchQuery, PangtiSearchResponse } from '@giaan-khand/contracts'

import type { SearchService } from './contracts'
import { buildTypesenseQuery } from './pangti-document'

const COLLECTION_NAME = 'pangtis'

const encodeCursor = (page: number) => Buffer.from(JSON.stringify({ page }), 'utf8').toString('base64url')

const decodeCursor = (cursor?: string | null) => {
  if (!cursor) {
    return 1
  }

  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as { page?: number }
    return parsed.page && parsed.page > 0 ? parsed.page : 1
  } catch {
    return 1
  }
}

export const createTypesenseSearchClient = () =>
  new Typesense.Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST ?? 'localhost',
        port: Number(process.env.TYPESENSE_PORT ?? '8108'),
        protocol: process.env.TYPESENSE_PROTOCOL ?? 'http',
      },
    ],
    apiKey: process.env.TYPESENSE_API_KEY ?? 'xyz',
    connectionTimeoutSeconds: 10,
  })

export const createTypesenseSearchService = (
  client = createTypesenseSearchClient(),
): SearchService => ({
  async searchPangtis(query: PangtiSearchQuery): Promise<PangtiSearchResponse> {
    const page = decodeCursor(query.cursor)
    const perPage = Math.max(1, Math.min(query.limit ?? 20, 50))
    const search = buildTypesenseQuery(query.q)

    const result = await client.collections(COLLECTION_NAME).documents().search({
      q: search.normalizedQuery,
      query_by: search.queryBy,
      filter_by: query.work ? `workSlug:=${query.work}` : undefined,
      prefix: search.prefix,
      page,
      per_page: perPage,
      sort_by: '_text_match:desc,workPosition:asc',
      highlight_fields: 'none',
    })

    const found = result.found ?? 0
    const nextPage = page * perPage < found ? page + 1 : null

    return {
      items:
        result.hits?.map((hit) => {
          const document = hit.document as Record<string, string | number>

          return {
            passageId: String(document.passageId),
            workSlug: String(document.workSlug),
            workTitle: String(document.workTitle),
            structureLabel: String(document.structureLabel),
            locatorLabel: String(document.locatorLabel),
            originalText: String(document.originalText),
            matchedBy: search.mode,
            matchedInitials: String(document.gurmukhiInitials),
            score: hit.text_match ?? 0,
          }
        }) ?? [],
      nextCursor: nextPage ? encodeCursor(nextPage) : null,
      queryMeta: {
        mode: search.mode,
        normalizedQuery: search.normalizedQuery,
        page,
        limit: perPage,
        total: found,
      },
    }
  },
})
