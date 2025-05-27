import {
  mysqlTable,
  mysqlEnum,
  varchar,
  date,
  double
} from 'drizzle-orm/mysql-core'
import { region } from './region'

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
  status: mysqlEnum('status', ['HAMIL', 'MENYUSUI', 'ANAK-ANAK']).notNull(),
  latitude: double('latitude').notNull(),
  longitude: double('longitude').notNull(),
  regionId: varchar('region_id', { length: 36 })
    .notNull()
    .references(() => region.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  initialWeight: double('initial_weight').notNull().default(0),
  initialHeight: double('initial_height').notNull().default(0)
})
