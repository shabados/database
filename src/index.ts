import { drizzle } from 'drizzle-orm/libsql'

import { MASTER_DB } from './paths'
import relations from './relations'
import * as schema from './schema'

export const defaultConfig = {
  casing: 'snake_case',
  relations,
  schema,
} as const


type Options = {
  path?: string
}

const createDatabaseClient = ({ path = MASTER_DB }: Options = {}) =>
  drizzle({
    ...defaultConfig,
    connection: {
      url: `file:${path}`,
    },
  })

export default createDatabaseClient

export * from './paths'