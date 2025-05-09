import { drizzle } from 'drizzle-orm/mysql2'
import * as userSchemas from './schema/user'

const { DATABASE_URL } = process.env

export const db = drizzle(DATABASE_URL, {
  mode: 'default',
  schema: {
    ...userSchemas
  },
  logger: true
})
