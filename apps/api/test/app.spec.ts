import assert from 'node:assert/strict'
import test from 'node:test'

import type {
  PangtiSearchQuery,
  PangtiSearchResponse,
  PassageDetailResponse,
  WorkDetailResponse,
  WorksResponse,
} from '@giaan-khand/contracts'

import { createApiApp } from '../src/app'

const fakeWorksResponse: WorksResponse = {
  items: [
    {
      id: 'work-1',
      slug: 'guru-granth-sahib',
      title: {
        Guru: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ',
      },
      translation: {
        en: 'Guru Granth Sahib',
      },
      summary: {
        en: 'The central Sikh scripture.',
      },
      classification: 'scripture',
      textShape: 'verse',
      featured: true,
    },
  ],
}

const fakeWorkDetail: WorkDetailResponse = {
  work: fakeWorksResponse.items[0],
  sections: [
    {
      id: 'section-1',
      slug: 'japji-sahib',
      nodeType: 'composition',
      title: {
        Guru: 'ਜਪੁਜੀ ਸਾਹਿਬ',
      },
      translation: {
        en: 'Japji Sahib',
      },
      description: null,
      position: 1,
    },
  ],
}

const fakePassage: PassageDetailResponse = {
  passageId: 'passage-1',
  workSlug: 'guru-granth-sahib',
  workTitle: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ',
  structureLabel: 'ਜਪੁਜੀ ਸਾਹਿਬ',
  locatorLabel: 'Page 1',
  originalText: 'ਇਕ ਓਅੰਕਾਰ ਸਤਿਨਾਮੁ',
  pageStart: 1,
  pageEnd: 1,
}

const fakeSearchResponse: PangtiSearchResponse = {
  items: [
    {
      passageId: 'passage-1',
      workSlug: 'guru-granth-sahib',
      workTitle: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ',
      structureLabel: 'ਜਪੁਜੀ ਸਾਹਿਬ',
      locatorLabel: 'Page 1',
      originalText: 'ਇਕ ਓਅੰਕਾਰ ਸਤਿਨਾਮੁ',
      matchedBy: 'latin-initials',
      matchedInitials: 'ਇਓਸ',
      score: 100,
    },
  ],
  nextCursor: null,
  queryMeta: {
    mode: 'latin-initials',
    normalizedQuery: 'ios',
    page: 1,
    limit: 20,
    total: 1,
  },
}

const createFakeApp = () =>
  createApiApp({
    workRepository: {
      listWorks: async () => fakeWorksResponse,
      getWorkDetail: async (slug: string) => (slug === fakeWorkDetail.work.slug ? fakeWorkDetail : null),
      getPassageDetail: async (id: string) => (id === fakePassage.passageId ? fakePassage : null),
    },
    searchService: {
      searchPangtis: async (query: PangtiSearchQuery) => ({
        ...fakeSearchResponse,
        queryMeta: {
          ...fakeSearchResponse.queryMeta,
          normalizedQuery: query.q,
        },
      }),
    },
  })

test('GET /v1/works returns work summaries', async () => {
  const app = await createFakeApp()
  const response = await app.inject({
    method: 'GET',
    url: '/v1/works',
  })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), fakeWorksResponse)

  await app.close()
})

test('GET /v1/works/:slug returns one work detail', async () => {
  const app = await createFakeApp()
  const response = await app.inject({
    method: 'GET',
    url: `/v1/works/${fakeWorkDetail.work.slug}`,
  })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), fakeWorkDetail)

  await app.close()
})

test('GET /v1/passages/:id returns passage detail', async () => {
  const app = await createFakeApp()
  const response = await app.inject({
    method: 'GET',
    url: `/v1/passages/${fakePassage.passageId}`,
  })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), fakePassage)

  await app.close()
})

test('GET /v1/search/pangtis validates and returns search results', async () => {
  const app = await createFakeApp()
  const response = await app.inject({
    method: 'GET',
    url: '/v1/search/pangtis?q=ਇਕ',
  })

  assert.equal(response.statusCode, 200)
  assert.match((response.json() as PangtiSearchResponse).items[0]?.originalText ?? '', /ਇਕ/)

  await app.close()
})

test('GET /v1/search/pangtis rejects an empty query', async () => {
  const app = await createFakeApp()
  const response = await app.inject({
    method: 'GET',
    url: '/v1/search/pangtis?q=',
  })

  assert.equal(response.statusCode, 400)

  await app.close()
})
