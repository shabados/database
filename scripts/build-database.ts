import { Glob } from 'bun'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { basename } from 'node:path'

import { consola } from 'consola'
import { eq } from 'drizzle-orm'
import type { BatchItem } from 'drizzle-orm/batch'
import { drizzle } from 'drizzle-orm/libsql'
import type { SQLiteTable, TableConfig } from 'drizzle-orm/sqlite-core'
import { parse } from 'smol-toml'

import { DIST_PATH, MASTER_DB } from '#~/paths'
import * as schema from '#~/schema'
import type { Asset } from '#collections-types/assets'
import type { Author } from '#collections-types/authors'
import type { Banis } from '#collections-types/banis'
import type { LineGroups } from '#collections-types/line-groups'
import type { Lines } from '#collections-types/lines'
import type { Sections } from '#collections-types/sections'
import type { Sources } from '#collections-types/sources'

const require = createRequire(import.meta.url)

type DrizzleKitApi = typeof import('drizzle-kit/api')
const { generateSQLiteMigration, generateSQLiteDrizzleJson } =
  require('drizzle-kit/api') as DrizzleKitApi

consola.box('Building SQLite database')
consola.info(`Output path: ${MASTER_DB}\n`)

await mkdir(DIST_PATH, { recursive: true })
await rm(MASTER_DB, { force: true })

const db = drizzle({
  casing: 'snake_case',
  connection: {
    url: `file:./${MASTER_DB}`,
  },
})

consola.start('Generating schema')

const createStatements = await generateSQLiteMigration(
  await generateSQLiteDrizzleJson({}),
  await generateSQLiteDrizzleJson(schema, undefined, 'snake_case'),
)

for (const stmt of createStatements) {
  await db.run(stmt)
}

consola.success('Database initialized\n')

const statements: [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]] = [db.run('Select 1')]

const importCollection = async <CollectionSchema, DatabaseSchema extends SQLiteTable<TableConfig>>(
  name: string,
  schema: DatabaseSchema,
  mapper: (schema: CollectionSchema, id: string) => DatabaseSchema['$inferInsert'],
) => {
  consola.start(`Importing ${name}`)

  const files = new Glob(`./collections/${name}/**/*.toml`).scan()

  for await (const filePath of files) {
    const id = basename(filePath, '.toml')
    const data = parse(await readFile(filePath, 'utf-8')) as unknown as CollectionSchema

    statements.push(db.insert(schema).values(mapper(data, id)))
  }
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

await importCollection<Lines, typeof schema.lines>('lines', schema.lines, ({ content }, id) => {
  for (const [index, { asset, data, ...additional }] of content.entries()) {
    statements.push(
      db.insert(schema.assetLines).values({
        lineId: id,
        assetId: asset,
        data,
        type: additional.type,
        additional,
        priority: index + 1,
      }),
    )
  }

  return { id }
})

await importCollection<Author, typeof schema.authors>(
  'authors',
  schema.authors,
  ({ name, otherNames }, id) => ({
    id,
    name,
    otherNames,
  }),
)

await importCollection<LineGroups, typeof schema.lineGroups>(
  'line-groups',
  schema.lineGroups,
  ({ author, lines, externalReferences }, id) => {
    for (const [index, lineId] of lines.entries()) {
      statements.push(
        db
          .update(schema.lines)
          .set({ lineGroupId: id, lineGroupOrder: index + 1 })
          .where(eq(schema.lines.id, lineId)),
      )
    }

    return {
      id,
      authorId: author,
      externalReferences,
    }
  },
)

await importCollection<Sections, typeof schema.sections>(
  'sections',
  schema.sections,
  ({ name, description, lineGroups }, id) => {
    for (const [index, lineGroupId] of lineGroups.entries()) {
      statements.push(
        db
          .update(schema.lineGroups)
          .set({ sectionId: id, sectionOrder: index + 1 })
          .where(eq(schema.lineGroups.id, lineGroupId)),
      )
    }

    return { id, description, name }
  },
)

await importCollection<Sources, typeof schema.sources>(
  'sources',
  schema.sources,
  ({ name, translation, sections }, id) => {
    for (const [index, sectionId] of sections.entries()) {
      statements.push(
        db
          .update(schema.sections)
          .set({ sourceId: id, sourceOrder: index + 1 })
          .where(eq(schema.sections.id, sectionId)),
      )
    }

    return { id, name, translation }
  },
)

await importCollection<Banis, typeof schema.banis>(
  'banis',
  schema.banis,
  ({ name, sections }, id) => {
    for (const [sectionIndex, { lines }] of sections.entries()) {
      for (const [lineIndex, lineId] of lines.entries()) {
        statements.push(
          db.insert(schema.baniLines).values({
            baniId: id,
            lineId,
            sectionOrder: sectionIndex + 1,
            lineOrder: lineIndex + 1,
          }),
        )
      }
    }

    return { id, name }
  },
)

console.log('')
consola.start('Committing changes')
await db.batch(statements)
consola.success('Changes committed\n')
