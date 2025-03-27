import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  casing: 'snake_case',
  schema: './src/schema.ts',
  dbCredentials: {
    url: 'file:./dist/database.sqlite',
  },
})
