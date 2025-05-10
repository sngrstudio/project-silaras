import { mysqlTable, varchar, text, int } from 'drizzle-orm/mysql-core'

export const settingsTable = mysqlTable('settings', {
  property: varchar({
    length: 255,
    enum: ['SITE_NAME', 'SITE_DESCRIPTION', 'SITE_LOGO']
  }).primaryKey(),
  value: text().notNull()
})

export const menuTable = mysqlTable('menu', {
  id: int().autoincrement().primaryKey(),
  label: text().notNull(),
  path: text().notNull(),
  category: text({ enum: ['Administrasi', 'Pengguna'] })
})
