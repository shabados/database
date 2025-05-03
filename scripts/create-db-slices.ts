import { mkdir, rm } from 'node:fs/promises'

import { consola } from 'consola'
import { eq, not, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'

import * as schema from '#~/schema'

consola.box('Creating database slices')

const DIST_PATH = 'dist'
const SLICES_PATH = `${DIST_PATH}/slices`
const MASTER_DB = `${DIST_PATH}/master.sqlite`
const BASE_DB = `${SLICES_PATH}/base.sqlite`

await mkdir(SLICES_PATH, { recursive: true })

const createDatabaseClient = (path = './dist/master.sqlite') =>
  drizzle({
    casing: 'snake_case',
    connection: {
      url: `file:${path}`,
    },
  })

async function copyDb(src: string, dest: string) {
  await rm(dest, { force: true })

  const db = createDatabaseClient(src)
  await db.run(sql`VACUUM INTO ${dest}`)

  db.$client.close()
}

async function clearAssetTables(path: string) {
  const db = createDatabaseClient(path)

  await db.delete(schema.assetLines)
  await db.delete(schema.assets)

  await db.run('VACUUM')

  db.$client.close()
}

async function createAssetDb(assetId: string) {
  const path = `${SLICES_PATH}/asset-${assetId}.sqlite`

  await copyDb(MASTER_DB, path)

  const db = createDatabaseClient(path)

  await Promise.all(
    Object.keys(schema)
      .filter((key) => !['assetLines', 'assets'].includes(key))
      .map((table) => db.delete(schema[table as keyof typeof schema])),
  )

  await db.delete(schema.assetLines).where(not(eq(schema.assetLines.assetId, assetId)))
  await db.delete(schema.assets).where(not(eq(schema.assets.id, assetId)))

  await db.run('VACUUM')

  db.$client.close()
}

consola.start('Creating base database')
await copyDb(MASTER_DB, BASE_DB)
await clearAssetTables(BASE_DB)
consola.success('Base database created')

const db = createDatabaseClient(MASTER_DB)
const allAssets = await db.select({ id: schema.assets.id }).from(schema.assets)
db.$client.close()

consola.info(`Found ${allAssets.length} assets\n`)

for (const asset of allAssets) {
  consola.start(`Creating asset database for ${asset.id}`)
  await createAssetDb(asset.id)
  consola.success(`Asset database created for ${asset.id}\n`)
}
