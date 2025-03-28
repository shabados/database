import { relations } from 'drizzle-orm'
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
})

export const sectionsRelations = relations(sections, ({ many, one }) => ({
  lineGroups: many(lineGroups),
  source: one(sources, {
    fields: [sections.sourceId],
    references: [sources.id],
  }),
}))

export const authors = sqliteTable('authors', {
  id: text().primaryKey(),
  name: json(),
  otherNames: json(),
})

export const authorsRelations = relations(authors, ({ many }) => ({
  lineGroups: many(lineGroups),
}))

export const lineGroups = sqliteTable('lineGroups', {
  id: text().primaryKey(),
  sectionId: text(),
  authorId: text(),
  index: integer(),
})

export const lineGroupsRelations = relations(lineGroups, ({ many, one }) => ({
  section: one(sections, {
    fields: [lineGroups.sectionId],
    references: [sections.id],
  }),
  author: one(authors, {
    fields: [lineGroups.authorId],
    references: [authors.id],
  }),
  lines: many(lines),
}))

export const lines = sqliteTable('lines', {
  id: text().primaryKey(),
  lineGroupId: text(),
  content: json(),
  index: integer(),
})

export const linesRelations = relations(lines, ({ one }) => ({
  lineGroup: one(lineGroups, {
    fields: [lines.lineGroupId],
    references: [lineGroups.id],
  }),
}))
