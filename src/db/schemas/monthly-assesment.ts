import { mysqlTable, varchar, double } from 'drizzle-orm/mysql-core'
import { patient } from './patient'

export const monthlyAssesment = mysqlTable('monthly_assesment', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .notNull()
    .$default(() => Bun.randomUUIDv7()),
  patientId: varchar('patient_id', { length: 255 })
    .notNull()
    .references(() => patient.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  month: varchar('month', { length: 255 }).notNull(),
  weight: double('weight').notNull(),
  height: double('height').notNull()
})
