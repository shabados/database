import 'dotenv/config'

import { createProductDatabaseClient } from './db/client'
import { createPostgresWorkRepository } from './db/repositories'
import { createApiApp } from './app'
import { createTypesenseSearchService } from './services/typesense-search'

const port = Number(process.env.API_PORT ?? 4000)

const db = createProductDatabaseClient()
const workRepository = createPostgresWorkRepository(db)
const searchService = createTypesenseSearchService()

const app = await createApiApp({
  searchService,
  workRepository,
})

await app.listen({
  host: '0.0.0.0',
  port,
})

