import { index, integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core'

import type { LanguageField, Metadata, ScriptField } from '../../../../archive/src/types'

const json = <T>() => jsonb().$type<T>()

export const works = pgTable(
  'product_works',
  {
    id: text().primaryKey(),
    slug: text().notNull(),
    title: json<ScriptField>().notNull(),
    translation: json<LanguageField | null>(),
    classification: text().notNull(),
    textShape: text().notNull(),
    summary: json<LanguageField | null>(),
    metadata: json<Metadata | null>(),
  },
  (table) => [index('product_work_slug_index').on(table.slug)],
)

export const structureNodes = pgTable(
  'product_structure_nodes',
  {
    id: text().primaryKey(),
    workId: text()
      .notNull()
      .references(() => works.id),
    parentId: text(),
    slug: text().notNull(),
    nodeType: text().notNull(),
    title: json<ScriptField>().notNull(),
    translation: json<LanguageField | null>(),
    description: json<LanguageField | null>(),
    position: integer().notNull(),
    metadata: json<Metadata | null>(),
  },
  (table) => [
    index('product_structure_node_slug_index').on(table.slug),
    index('product_structure_node_work_parent_position_index').on(
      table.workId,
      table.parentId,
      table.position,
    ),
  ],
)

export const passages = pgTable(
  'product_passages',
  {
    id: text().primaryKey(),
    workId: text()
      .notNull()
      .references(() => works.id),
    structureNodeId: text()
      .notNull()
      .references(() => structureNodes.id),
    slug: text().notNull(),
    passageType: text().notNull(),
    position: integer().notNull(),
    reference: text(),
    metadata: json<Metadata | null>(),
  },
  (table) => [
    index('product_passage_slug_index').on(table.slug),
    index('product_passage_node_position_index').on(table.structureNodeId, table.position),
    index('product_passage_work_position_index').on(table.workId, table.position),
  ],
)

export const passageTexts = pgTable(
  'product_passage_texts',
  {
    id: text().primaryKey(),
    passageId: text()
      .notNull()
      .references(() => passages.id),
    witnessId: text().notNull(),
    slug: text().notNull(),
    contentRole: text().notNull(),
    languageCode: text(),
    scriptCode: text(),
    body: text().notNull(),
    position: integer().notNull(),
    page: integer(),
    pageStart: integer(),
    pageEnd: integer(),
    folio: text(),
    folioStart: text(),
    folioEnd: text(),
    localIndex: integer(),
    unitStart: integer(),
    unitEnd: integer(),
    metadata: json<Metadata | null>(),
  },
  (table) => [
    index('product_passage_text_slug_index').on(table.slug),
    index('product_passage_text_passage_position_index').on(table.passageId, table.position),
    index('product_passage_text_role_position_index').on(
      table.contentRole,
      table.scriptCode,
      table.position,
    ),
    index('product_passage_text_page_range_index').on(table.pageStart, table.pageEnd),
  ],
)

export const productSchema = {
  works,
  structureNodes,
  passages,
  passageTexts,
}

