import { Database } from 'bun:sqlite'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { basename } from 'node:path'
import { Glob } from 'bun'
import { consola } from 'consola'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { parse } from 'smol-toml'
import * as schema from '#~/schema'
const require = createRequire(import.meta.url)

type DrizzleKitApi = typeof import('drizzle-kit/api')
const { generateSQLiteMigration, generateSQLiteDrizzleJson } =
  require('drizzle-kit/api') as DrizzleKitApi

const DIST_PATH = 'dist'
const DB_PATH = `${DIST_PATH}/database.sqlite`
consola.box('Building SQLite database')
consola.info(`Output path: ${DB_PATH}\n`)

await mkdir(DIST_PATH, { recursive: true })
await rm(DB_PATH, { force: true })

const sqlite = new Database(DB_PATH)

const db = drizzle({
  casing: 'snake_case',
  client: sqlite,
})

consola.start('Generating schema')

const createStatements = await generateSQLiteMigration(
  await generateSQLiteDrizzleJson({}),
  await generateSQLiteDrizzleJson(schema, undefined, 'snake_case'),
)

for (const stmt of createStatements) {
  db.run(stmt)
}

consola.success('Database initialized\n')

consola.start('Importing assets')

import type { Asset } from '../collections/$schemas/.types/assets'

const scan = (path: string) => new Glob(path).scan()

const statements = []

for await (const filePath of scan('./collections/assets/**/*.toml')) {
  const id = basename(filePath, '.toml')
  const data = parse(await readFile(filePath, 'utf-8')) as unknown as Asset

  statements.push(
    db.insert(schema.assets).values({
      id,
      name: data.name,
      reference: data.reference,
    }),
  )
}

await Promise.all(statements)

consola.success('Imported assets\n')
