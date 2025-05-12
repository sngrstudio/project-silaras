import { drizzle } from 'drizzle-orm/mysql2'
import * as siteSchemas from './schema/site'
import * as userSchemas from './schema/user'
import * as regionSchemas from './schema/region'
import * as imageSchemas from './schema/image'

const { DATABASE_URL } = process.env

export const db = drizzle(DATABASE_URL, {
  mode: 'default',
  schema: {
    ...siteSchemas,
    ...userSchemas,
    ...regionSchemas,
    ...imageSchemas
  },
  logger: true
})
