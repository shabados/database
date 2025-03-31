import { Database } from 'bun:sqlite'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { basename } from 'node:path'
import { Glob } from 'bun'
import { consola } from 'consola'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import type { SQLiteTable, TableConfig } from 'drizzle-orm/sqlite-core'
import { parse } from 'smol-toml'
import * as schema from '#~/schema'

import type { Asset } from '../collections/$schemas/.types/assets'
import type { Author } from '../collections/$schemas/.types/authors'

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

const scan = (path: string) => new Glob(path).scan()

const importCollection = async <CollectionSchema, DatabaseSchema extends SQLiteTable<TableConfig>>(
  name: string,
  schema: DatabaseSchema,
  mapper: (schema: CollectionSchema, id: string) => DatabaseSchema['$inferInsert'],
) => {
  consola.start(`Importing ${name}`)

  const statements = []

  for await (const filePath of scan(`./collections/${name}/**/*.toml`)) {
    const id = basename(filePath, '.toml')
    const data = parse(await readFile(filePath, 'utf-8')) as unknown as CollectionSchema

    statements.push(db.insert(schema).values(mapper(data, id)))
  }

  return Promise.all(statements).then(() => consola.success(`Imported ${name}\n`))
}

await importCollection<Asset, typeof schema.assets>(
  'assets',
  schema.assets,
  ({ name, reference }, id) => ({
    id,
    name,
    reference,
  }),
)

await importCollection<Author, typeof schema.authors>(
  'authors',
  schema.authors,
  ({ name, otherNames }, id) => ({
    id,
    name,
    otherNames,
  }),
)
