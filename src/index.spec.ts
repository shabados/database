import { describe, expect, it } from 'bun:test'

import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { SQLiteRelationalQuery } from 'drizzle-orm/sqlite-core/query-builders/query'
import { parse } from 'smol-toml'

import { LineGroups } from '#collections-types/line-groups'

import createDbClient from '.'
import { getQueryPlan } from './query-utils'
import relations from './relations'
import * as schema from './schema'

const getCollectionDoc = async <Schema>(document: string) =>
  parse(await Bun.file(`collections/${document}.toml`).text()) as Schema

// Generic function to test query plan optimization
const expectOptimizedQueryPlan = async <Q extends SQLiteRelationalQuery<'async', unknown>>(
  db: LibSQLDatabase<typeof schema, typeof relations>,
  query: Q,
  {
    maxTableScans = 0,
    expectedIndexes = [],
  }: { maxTableScans?: number; expectedIndexes?: string[] } = {},
) => {
  const queryPlan = await getQueryPlan(db, query)
  const planText = queryPlan.join(' ')

  const tableScans = queryPlan.filter(
    (step) => typeof step === 'string' && step.includes('SCAN') && !step.includes('USING INDEX'),
  ).length

  expect(tableScans, planText).toBeLessThanOrEqual(maxTableScans)
  expectedIndexes.forEach((indexName) => expect(planText).toContain(indexName))

  return queryPlan
}

describe('Database', () => {
  describe('line groups', () => {
    it('should return, optimized, lines in order', async () => {
      const db = createDbClient()
      const id = 'DMP'

      const lineGroupQuery = db.query.lineGroups.findFirst({
        where: { id },
        with: {
          author: true,
          lines: {
            orderBy: {
              lineGroupOrder: 'asc',
            },
          },
        },
      })
      const lineGroup = await lineGroupQuery

      const collectionDoc = await getCollectionDoc<LineGroups>(`line-groups/D/${id}`)

      expect(lineGroup?.lines.map((line) => line.id)).toEqual(collectionDoc.lines)
      expect(lineGroup?.author.id).toEqual(collectionDoc.author)
      await expectOptimizedQueryPlan(db, lineGroupQuery, {
        maxTableScans: 2,
        expectedIndexes: [
          'sqlite_autoindex_line_groups_1',
          'sqlite_autoindex_authors_1',
          'line_group_id_order_index',
        ],
      })
    })
  })
})
