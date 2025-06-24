import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { SQLiteRelationalQuery } from 'drizzle-orm/sqlite-core/query-builders/query'

import relations from './relations'
import * as schema from './schema'

export const getQueryPlan = async <Q extends SQLiteRelationalQuery<'async', unknown>>(
  db: LibSQLDatabase<typeof schema, typeof relations>,
  query: Q,
) => db.run(`EXPLAIN QUERY PLAN ${query.toSQL().sql}`).then((r) => r.rows.map((row) => row.detail))
