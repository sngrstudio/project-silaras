import { drizzle } from 'drizzle-orm/mysql2'
import * as authSchema from './schema/auth'
import * as userProfileSchema from './schema/user'

const { DATABASE_URL } = process.env

export const db = drizzle(DATABASE_URL, {
  mode: 'default',
  schema: {
    ...authSchema,
    ...userProfileSchema
  }
})
