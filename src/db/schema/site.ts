import { mysqlTable, varchar, text } from 'drizzle-orm/mysql-core'

type SiteProperties = 'SITE_NAME' | 'SITE_DESCRIPTION' | 'SITE_LOGO'

export const settingsTable = mysqlTable('settings', {
  property: varchar({ length: 255 }).$type<SiteProperties>().primaryKey(),
  value: text().notNull()
})
