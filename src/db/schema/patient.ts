import { mysqlTable, varchar, int } from 'drizzle-orm/mysql-core'
import { kbVillageTable } from './region'

export const patientTable = mysqlTable('patient_table', {
  id: varchar({ length: 8 }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  condition: int()
    .notNull()
    .references(() => patientConditionsLookupTable.id),
  address: varchar({ length: 255 }),
  phoneNumber: varchar('phone_number', { length: 255 }),
  kbVillageId: varchar('kb_village_id', { length: 8 }).references(
    () => kbVillageTable.id,
    { onDelete: 'cascade', onUpdate: 'cascade' }
  )
})

export const patientConditionsLookupTable = mysqlTable(
  'patient_conditions_lookup_table',
  {
    id: int().autoincrement().primaryKey(),
    description: varchar({ length: 255 }).notNull()
  }
)
