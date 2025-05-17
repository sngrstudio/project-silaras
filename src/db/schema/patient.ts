import {
  mysqlTable,
  mysqlView,
  varchar,
  text,
  int,
  date
} from 'drizzle-orm/mysql-core'
import { regionOnWatchTable } from './region'
import { eq, sql } from 'drizzle-orm'

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
  region: varchar({ length: 255 })
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

export const patientView = mysqlView('patient_view').as((qb) => {
  return qb
    .select({
      patientId: patientTable.id,
      name: patientTable.name,
      motherName: patientTable.motherName,
      birthDate: patientTable.birthDate,
      address: patientTable.address,
      phoneNumber: patientTable.phoneNumber,
      description: sql<string>`${patientDescriptionTable.description}`.as(
        'patient_description'
      ),
      status: sql<string>`${patientStatusTable.description}`.as(
        'patient_status'
      )
    })
    .from(patientTable)
    .innerJoin(
      patientDescriptionTable,
      eq(patientDescriptionTable.id, patientTable.description)
    )
    .innerJoin(
      patientStatusTable,
      eq(patientStatusTable.id, patientTable.status)
    )
})
