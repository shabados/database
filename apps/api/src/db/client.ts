import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { productSchema } from './schema'

export const createProductPool = (connectionString = process.env.DATABASE_URL) => {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to connect to the product PostgreSQL database.')
  }

  return new Pool({
    connectionString,
  })
}

export const createProductDatabaseClient = (connectionString = process.env.DATABASE_URL) =>
  drizzle({
    casing: 'snake_case',
    client: createProductPool(connectionString),
    schema: productSchema,
  })

export type ProductDatabaseClient = ReturnType<typeof createProductDatabaseClient>
