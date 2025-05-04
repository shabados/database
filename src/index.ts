import { drizzle } from 'drizzle-orm/libsql'

import { MASTER_DB } from './paths'
import relations from './relations'

type Options = {
  path?: string
}

const createDatabaseClient = ({ path = MASTER_DB }: Options = {}) =>
  drizzle({
    relations,
    casing: 'snake_case',
    connection: {
      url: `file:${path}`,
    },
  })

export default createDatabaseClient

export * from './paths'
export { relations }
