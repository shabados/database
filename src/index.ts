import { drizzle } from 'drizzle-orm/libsql'

import relations from './relations'
import * as schema from './schema'

type Options = {
  path?: string
}

const createDatabaseClient = ({ path = './dist/database.sqlite' }: Options = {}) =>
  drizzle({
    relations,
    schema,
    casing: 'snake_case',
    connection: {
      url: `file:${path}`,
    },
  })

export default createDatabaseClient
