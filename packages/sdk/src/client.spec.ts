import assert from 'node:assert/strict'
import test from 'node:test'

import { createApiClient } from './client'

test('createApiClient parses work list responses', async () => {
  const client = createApiClient('http://example.test', async () => {
    return new Response(
      JSON.stringify({
        items: [
          {
            id: 'work-1',
            slug: 'guru-granth-sahib',
            title: {
              Guru: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ',
            },
            translation: null,
            classification: 'scripture',
            textShape: 'verse',
            featured: true,
          },
        ],
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      },
    )
  })

  const response = await client.listWorks()

  assert.equal(response.items[0]?.slug, 'guru-granth-sahib')
})

