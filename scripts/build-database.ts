import { mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '#~/src/schema'
const require = createRequire(import.meta.url)

type DrizzleKitApi = typeof import('drizzle-kit/api')
const { generateSQLiteMigration, generateSQLiteDrizzleJson, generateDrizzleJson } =
  require('drizzle-kit/api') as DrizzleKitApi

const DIST_PATH = 'dist'

await mkdir(DIST_PATH, { recursive: true })

const db = drizzle({
  connection: {
    url: `file:./${DIST_PATH}/database.sqlite`,
  },
})

const createStatements = await generateSQLiteMigration(
  await generateSQLiteDrizzleJson({}),
  await generateSQLiteDrizzleJson(schema),
).then((migrations) => migrations.join('\n'))

await db.run(createStatements)

await db.insert(schema.assets).values({
  id: '1',
  name: 'Test Asset',
  description: 'Test Description',
})
