import assert from 'node:assert/strict'
import test from 'node:test'

import { archiveSchema } from '../src/lib/archive-source'
import { importArchiveIntoProductDb } from '../src/db/import-archive'
import { passageTexts, passages, structureNodes, works } from '../src/db/schema'
import { pangtiFixtures } from './fixtures/pangti'

type TableName = 'works' | 'structureNodes' | 'passages' | 'passageTexts'

const getTableName = (table: object): TableName => {
  if (table === archiveSchema.works || table === works) {
    return 'works'
  }

  if (table === archiveSchema.structureNodes || table === structureNodes) {
    return 'structureNodes'
  }

  if (table === archiveSchema.passages || table === passages) {
    return 'passages'
  }

  if (table === archiveSchema.passageTexts || table === passageTexts) {
    return 'passageTexts'
  }

  throw new Error('Unknown table')
}

const createArchiveDb = () => {
  const datasets: Record<TableName, unknown[]> = {
    works: pangtiFixtures.works,
    structureNodes: pangtiFixtures.structureNodes,
    passages: pangtiFixtures.passages,
    passageTexts: pangtiFixtures.passageTexts,
  }

  const makeQuery = (tableName: TableName) => {
    let limit = Number.POSITIVE_INFINITY

    const query = {
      orderBy: () => query,
      limit: (value: number) => {
        limit = value
        return query
      },
      offset: (offset: number) =>
        Promise.resolve(datasets[tableName].slice(offset, offset + limit) as never[]),
    }

    return query
  }

  return {
    select: () => ({
      from: (table: object) => makeQuery(getTableName(table)),
    }),
  }
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const createProductDb = () => {
  const calls: Array<{ table: TableName; rows: unknown[] }> = []

  const makeInsert = (tableName: TableName) => ({
    values: (rows: unknown[]) => {
      calls.push({ table: tableName, rows: clone(rows) })

      return {
        onConflictDoUpdate: async () => undefined,
      }
    },
  })

  return {
    calls,
    db: {
      insert: (table: object) => makeInsert(getTableName(table)),
    },
  }
}

const flattenRowsByTable = (calls: Array<{ table: TableName; rows: unknown[] }>) =>
  calls.reduce<Record<TableName, unknown[]>>(
    (accumulator, call) => {
      accumulator[call.table].push(...call.rows)
      return accumulator
    },
    {
      works: [],
      structureNodes: [],
      passages: [],
      passageTexts: [],
    },
  )

const importedPassageTexts = pangtiFixtures.passageTexts.map(
  ({ citationId: _citationId, ...row }) => row,
)

test('importArchiveIntoProductDb maps archive rows into stable product upserts', async () => {
  const archiveDb = createArchiveDb()
  const product = createProductDb()

  const stats = await importArchiveIntoProductDb(archiveDb as never, product.db as never, 1)

  assert.deepEqual(stats, {
    works: 2,
    structureNodes: 2,
    passages: 2,
    passageTexts: 2,
  })

  assert.deepEqual(flattenRowsByTable(product.calls), {
    works: pangtiFixtures.works,
    structureNodes: pangtiFixtures.structureNodes,
    passages: pangtiFixtures.passages,
    passageTexts: importedPassageTexts,
  })
})

test('importArchiveIntoProductDb emits the same upsert shape on repeated runs', async () => {
  const archiveDb = createArchiveDb()
  const firstRun = createProductDb()
  const secondRun = createProductDb()

  await importArchiveIntoProductDb(archiveDb as never, firstRun.db as never, 1)
  await importArchiveIntoProductDb(archiveDb as never, secondRun.db as never, 1)

  assert.deepEqual(firstRun.calls, secondRun.calls)
})
