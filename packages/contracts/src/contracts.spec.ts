import assert from 'node:assert/strict'
import test from 'node:test'

import { pangtiSearchQuerySchema, worksResponseSchema } from './contracts'

test('pangtiSearchQuerySchema accepts a valid query payload', () => {
  const parsed = pangtiSearchQuerySchema.parse({
    q: 'ਦਕਗ',
    limit: '10',
  })

  assert.equal(parsed.limit, 10)
})

test('worksResponseSchema requires an items array', () => {
  const parsed = worksResponseSchema.parse({
    items: [],
  })

  assert.deepEqual(parsed.items, [])
})

