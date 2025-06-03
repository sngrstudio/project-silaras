import { mysqlTable, varchar, text } from 'drizzle-orm/mysql-core'

export const site = mysqlTable('site', {
  property: varchar({
    length: 255,
    enum: ['SITE_NAME', 'SITE_DESCRIPTION']
  }).primaryKey(),
  value: text().notNull()
})
