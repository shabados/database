import { defineConfig } from 'drizzle-kit'

import { MASTER_DB } from './src/paths'

export default defineConfig({
  dialect: 'sqlite',
  casing: 'snake_case',
  schema: './src/schema.ts',
  dbCredentials: {
    url: `file:${MASTER_DB}`,
  },
})
