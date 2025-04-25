import {
  mysqlTable,
  varchar,
  int,
  date,
  boolean,
  primaryKey
} from 'drizzle-orm/mysql-core'
import { patientTable } from './patient'

export const assesmentTable = mysqlTable(
  'assesment_table',
  {
    patientId: varchar('patient_id', { length: 8 })
      .notNull()
      .references(() => patientTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    date: date().notNull(),
    menu: int()
      .notNull()
      .references(() => assesmentMenuLookupTable.id),
    hasStapleFood: boolean('has_staple_food').default(false),
    hasSideDishes: boolean('has_side_dishes').default(false),
    hasVegetables: boolean('has_vegetables').default(false),
    hasFruits: boolean('has_fruits').default(false),
    isFollowingRecipe: boolean('is_following_recipe').default(false)
  },
  (table) => [primaryKey({ columns: [table.patientId, table.date] })]
)

export const assesmentMenuLookupTable = mysqlTable(
  'assesment_menu_lookup_table',
  {
    id: int().autoincrement().primaryKey(),
    description: varchar({ length: 255 }).notNull()
  }
)
