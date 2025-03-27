import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const languageStrings = sqliteTable('language_strings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').primaryKey(),
  value: text('value'),
})

export const scriptStrings = sqliteTable('script_strings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').primaryKey(),
  value: text('value'),
})

export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  name: text('name'),
  description: text('description'),
})
