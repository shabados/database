import { mkdir, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '#~/src/schema'
const require = createRequire(import.meta.url)

type DrizzleKitApi = typeof import('drizzle-kit/api')
const { generateSQLiteMigration, generateSQLiteDrizzleJson } =
  require('drizzle-kit/api') as DrizzleKitApi

const DIST_PATH = 'dist'
const DB_PATH = `${DIST_PATH}/database.sqlite`

await mkdir(DIST_PATH, { recursive: true })
await rm(DB_PATH, { force: true })

const db = drizzle({
  casing: 'snake_case',
  connection: {
    url: `file:./${DB_PATH}`,
  },
})

const createStatements = await generateSQLiteMigration(
  await generateSQLiteDrizzleJson({}),
  await generateSQLiteDrizzleJson(schema, undefined, 'snake_case'),
)

for (const stmt of createStatements) {
  await db.run(stmt)
}
