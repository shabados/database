import {
  pangtiSearchResponseSchema,
  passageDetailResponseSchema,
  workDetailResponseSchema,
  worksResponseSchema,
  type PangtiSearchQuery,
  type PangtiSearchResponse,
  type PassageDetailResponse,
  type WorkDetailResponse,
  type WorksResponse,
} from '@giaan-khand/contracts'

export type ApiClientOptions = {
  baseUrl?: string
  fetchImpl?: typeof fetch
}

const DEFAULT_API_BASE_URL = 'http://localhost:4000'

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const resolveApiBaseUrl = () =>
  trimTrailingSlash(
    process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.API_BASE_URL ??
      DEFAULT_API_BASE_URL,
  )

const buildUrl = (path: string, baseUrl: string) => new URL(path, `${baseUrl}/`).toString()

const requestJson = async <T>(
  path: string,
  schema: { parse: (value: unknown) => T },
  options: ApiClientOptions = {},
) => {
  const fetchImpl = options.fetchImpl ?? fetch
  const baseUrl = options.baseUrl ?? resolveApiBaseUrl()
  const response = await fetchImpl(buildUrl(path, baseUrl), {
    cache: 'no-store',
    headers: {
      accept: 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Request failed for ${path}: ${response.status}${body ? ` ${body}` : ''}`)
  }

  return schema.parse(await response.json())
}

export const createApiClient = (baseUrl?: string, fetchImpl?: typeof fetch) => ({
  listWorks: (): Promise<WorksResponse> =>
    requestJson('/v1/works', worksResponseSchema, { baseUrl, fetchImpl }),
  getWork: (slug: string): Promise<WorkDetailResponse> =>
    requestJson(`/v1/works/${encodeURIComponent(slug)}`, workDetailResponseSchema, {
      baseUrl,
      fetchImpl,
    }),
  getPassage: (id: string): Promise<PassageDetailResponse> =>
    requestJson(`/v1/passages/${encodeURIComponent(id)}`, passageDetailResponseSchema, {
      baseUrl,
      fetchImpl,
    }),
  searchPangtis: (query: PangtiSearchQuery): Promise<PangtiSearchResponse> => {
    const params = new URLSearchParams()

    params.set('q', query.q)

    if (query.work) {
      params.set('work', query.work)
    }

    if (query.cursor) {
      params.set('cursor', query.cursor)
    }

    if (query.limit) {
      params.set('limit', String(query.limit))
    }

    return requestJson(
      `/v1/search/pangtis?${params.toString()}`,
      pangtiSearchResponseSchema,
      {
        baseUrl,
        fetchImpl,
      },
    )
  },
})

