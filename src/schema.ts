import { DistributedOmit } from 'bun'

import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import type { LanguageField, ScriptField } from '#collections-types/common'
import type { Lines } from '#collections-types/lines'

const json = () => text({ mode: 'json' })

export const assets = sqliteTable('assets', {
  id: text().primaryKey(),
  name: json(),
  reference: json(),
})

export const sources = sqliteTable('sources', {
  id: text().primaryKey(),
  name: json().$type<ScriptField>(),
  translation: json().$type<LanguageField>(),
})

export const sections = sqliteTable(
  'sections',
  {
    id: text().primaryKey(),
    sourceId: text(),
    sourceOrder: integer(),
    name: json().$type<ScriptField>(),
    description: json().$type<LanguageField>(),
  },
  (t) => [index('source_order_index').on(t.sourceOrder)],
)

export const authors = sqliteTable('authors', {
  id: text().primaryKey(),
  name: json().$type<ScriptField>(),
  otherNames: json().$type<ScriptField[]>(),
})

export const lineGroups = sqliteTable(
  'line_groups',
  {
    id: text().primaryKey(),
    authorId: text(),
    sectionId: text(),
    sectionOrder: integer(),
  },
  (t) => [index('section_order_index').on(t.sectionOrder)],
)

export const lines = sqliteTable(
  'lines',
  {
    id: text().primaryKey(),
    lineGroupId: text(),
    lineGroupOrder: integer(),
  },
  (t) => [index('line_group_order_index').on(t.lineGroupOrder)],
)

type LinePayload = DistributedOmit<Lines['content'][number], 'asset' | 'data'>

export const assetLines = sqliteTable(
  'asset_lines',
  {
    assetId: text(),
    lineId: text(),
    type: text(),
    data: text(),
    additional: json().$type<LinePayload>(),
    priority: integer(),
  },
  (t) => [index('priority_index').on(t.priority)],
)
