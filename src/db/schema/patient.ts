import { mysqlTable, varchar, text, int, date } from 'drizzle-orm/mysql-core'
import { regionOnWatchTable } from './region'

export const patientTable = mysqlTable('patient', {
  id: varchar({ length: 255 })
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  name: text().notNull(),
  motherName: text('mother_name'),
  birthDate: date('birth_date').notNull(),
  description: int()
    .notNull()
    .references(() => patientDescriptionTable.id),
  status: int()
    .notNull()
    .references(() => patientStatusTable.id),
  address: text(),
  phoneNumber: text('phone_number').unique(),
  regionId: varchar('region_id', { length: 255 })
    .notNull()
    .references(() => regionOnWatchTable.regionId)
})

export const patientDescriptionTable = mysqlTable('patient_description', {
  id: int().autoincrement().primaryKey(),
  description: text().notNull()
})

export const patientStatusTable = mysqlTable('patient_status', {
  id: int().autoincrement().primaryKey(),
  description: text().notNull()
})

