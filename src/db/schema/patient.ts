import { mysqlTable, varchar, float } from 'drizzle-orm/mysql-core'
import { kbVillageTable } from './region'
import { nanoid } from 'nanoid'

export const patientTable = mysqlTable('patient_table', {
  id: varchar({ length: 8 })
    .primaryKey()
    .$defaultFn(() => `p_${nanoid(6)}`),
  name: varchar({ length: 255 }).notNull(),
  condition: varchar({ length: 8 })
    .notNull()
    .references(() => patientConditionsLookupTable.id),
  initialWeight: float('initial_weight').notNull(),
  initialHeight: float('initial_height').notNull(),
  address: varchar({ length: 255 }),
  phoneNumber: varchar('phone_number', { length: 255 }),
  kbVillageId: varchar('kb_village_id', { length: 8 })
    .notNull()
    .references(() => kbVillageTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
})

export const patientConditionsLookupTable = mysqlTable(
  'patient_conditions_lookup_table',
  {
    id: varchar({ length: 8 })
      .primaryKey()
      .$defaultFn(() => `pc_${nanoid(5)}`),
    description: varchar({ length: 255 }).notNull()
  }
)
