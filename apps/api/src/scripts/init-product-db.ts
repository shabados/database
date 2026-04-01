import 'dotenv/config'

import { createProductDatabaseClient } from '../db/client'
import { ensureProductSchema } from '../db/ensure-schema'

const db = createProductDatabaseClient()

await ensureProductSchema(db.$client)

console.log('Product PostgreSQL schema is ready.')
