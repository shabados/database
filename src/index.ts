import { drizzle } from 'drizzle-orm/libsql'

import relations from './relations'

type Options = {
  path?: string
}

const createDatabaseClient = ({ path = './dist/master.sqlite' }: Options = {}) =>
  drizzle({
    relations,
    casing: 'snake_case',
    connection: {
      url: `file:${path}`,
    },
  })

export default createDatabaseClient
