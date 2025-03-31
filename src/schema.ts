import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const json = () => text({ mode: 'json' })

export const assets = sqliteTable('assets', {
  id: text().primaryKey(),
  name: json(),
  reference: json(),
})

export const sources = sqliteTable('sources', {
  id: text().primaryKey(),
  name: json(),
  translation: json(),
})

export const sections = sqliteTable('sections', {
  id: text().primaryKey(),
  sourceId: text(),
  name: json(),
  description: json(),
  index: integer(),
})

export const authors = sqliteTable('authors', {
  id: text().primaryKey(),
  name: json(),
  otherNames: json(),
})

export const lineGroups = sqliteTable('line_groups', {
  id: text().primaryKey(),
  sectionId: text(),
  authorId: text(),
  index: integer(),
})

export const lines = sqliteTable('lines', {
  id: text().primaryKey(),
  lineGroupId: text(),
  content: json(),
  index: integer(),
})

export const assetLines = sqliteTable('asset_lines', {
  assetId: text(),
  lineId: text(),
  type: text(),
  data: text(),
  payload: json(),
})
