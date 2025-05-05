// @ts-check
import { defineConfig } from 'drizzle-kit'
import './polyfills/compression-stream' //polyfill for drizzle studio to work

const { DATABASE_URL } = process.env

export default defineConfig({
  dialect: 'mysql',
  schema: './src/db/schema/*',
  out: './src/db/__drizzle__',
  dbCredentials: {
    url: DATABASE_URL
  }
})
