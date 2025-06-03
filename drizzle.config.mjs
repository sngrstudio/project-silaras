// @ts-check
import { defineConfig } from 'drizzle-kit'

const { DATABASE_URL } = process.env

export default defineConfig({
  dialect: 'mysql',
  schema: './src/db/schemas/*',
  out: './src/db/__drizzle__',
  dbCredentials: {
    url: DATABASE_URL
  }
})
