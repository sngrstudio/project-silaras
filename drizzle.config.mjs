// @ts-check
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './src/db/__drizzle__',
  schema: './src/db/schema/*',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
})
