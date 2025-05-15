import { mysqlTable, varchar, text, int } from 'drizzle-orm/mysql-core'
import { accessLevelMapTable } from './user'

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
  category: text({ enum: ['Administrasi', 'Pengguna'] }),
  accessLevel: int('access_level').references(() => accessLevelMapTable.id)
})
