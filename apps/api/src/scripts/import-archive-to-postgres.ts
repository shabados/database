import 'dotenv/config'

import { createProductDatabaseClient } from '../db/client'
import { ensureProductSchema } from '../db/ensure-schema'
import { importArchiveIntoProductDb } from '../db/import-archive'
import { createArchiveSourceClient } from '../lib/archive-source'

const archiveDb = createArchiveSourceClient()
const productDb = createProductDatabaseClient()

await ensureProductSchema(productDb.$client)

const stats = await importArchiveIntoProductDb(archiveDb, productDb)

console.log(JSON.stringify(stats, null, 2))
