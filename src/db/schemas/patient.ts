import {
  mysqlTable,
  mysqlEnum,
  varchar,
  date,
  tinyint,
  double
} from 'drizzle-orm/mysql-core'
import { region } from './region'
import { sql, type SQL } from 'drizzle-orm'

/**
 * Patient table schema definition.
 *
 * Fields:
 * - id: string, primary key, generated with Bun.randomUUIDv7()
 * - name: string, patient name
 * - regionId: string, foreign key referencing region (should be of type 'DESA')
 */

export const patient = mysqlTable('patient', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .notNull()
    .$default(() => Bun.randomUUIDv7()),
  name: varchar('name', { length: 255 }).notNull(),
  motherName: varchar('mother_name', { length: 255 }).notNull(),
  birthDate: date('birth_date').notNull(),
  age: tinyint('age', { unsigned: true }).generatedAlwaysAs(
    (): SQL =>
      sql<number>`timestampdiff(month, ${patient.birthDate}, curdate())`,
    { mode: 'virtual' }
  ),
  status: mysqlEnum('status', ['HAMIL', 'MENYUSUI', 'ANAK-ANAK']).notNull(),
  phoneNumber: varchar('phone_number', { length: 255 }),
  address: varchar('address', { length: 255 }),
  latitude: double('latitude').notNull(),
  longitude: double('longitude').notNull(),
  regionId: varchar('region_id', { length: 36 })
    .notNull()
    .references(() => region.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  initialWeight: double('initial_weight', { precision: 5, scale: 2 }).notNull().default(0),
  initialHeight: double('initial_height', { precision: 5, scale: 2 }).notNull().default(0),
  initialBMI: double('initial_bmi', { precision: 5, scale: 2 }).generatedAlwaysAs(
    (): SQL =>
      sql<number>`${patient.initialWeight} / pow(${patient.initialHeight} / 100, 2)`,
    { mode: 'stored' }
  ),
  slug: varchar('slug', { length: 255 }).notNull().unique()
})
