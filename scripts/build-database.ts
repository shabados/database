import { Database } from 'bun:sqlite'
import { mkdir, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from '#~/src/schema'
import { log } from './helpers'
const require = createRequire(import.meta.url)

type DrizzleKitApi = typeof import('drizzle-kit/api')
const { generateSQLiteMigration, generateSQLiteDrizzleJson } =
  require('drizzle-kit/api') as DrizzleKitApi

const DIST_PATH = 'dist'
const DB_PATH = `${DIST_PATH}/database.sqlite`
log.stage(`Building database at ${DB_PATH}`)

await mkdir(DIST_PATH, { recursive: true })
await rm(DB_PATH, { force: true })

const sqlite = new Database(DB_PATH)

const db = drizzle({
  casing: 'snake_case',
  client: sqlite,
})

const createStatements = await generateSQLiteMigration(
  await generateSQLiteDrizzleJson({}),
  await generateSQLiteDrizzleJson(schema, undefined, 'snake_case'),
)

for (const stmt of createStatements) {
  db.run(stmt)
}

log.success('Database schema created')
