import {
  mysqlTable,
  varchar,
  foreignKey,
  primaryKey
} from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export const regionTable = mysqlTable(
  'region_table',
  {
    id: varchar({ length: 8 })
      .primaryKey()
      .$defaultFn(() => `r_${nanoid(6)}`),
    name: varchar({ length: 255 }).notNull(),
    parentRegionId: varchar('parent_region_id', { length: 8 })
  },
  (table) => [
    foreignKey({
      name: 'fk_region_table_parent_region',
      columns: [table.parentRegionId],
      foreignColumns: [table.id]
    })
      .onDelete('cascade')
      .onUpdate('cascade')
  ]
)

export const regionTableRelations = relations(regionTable, ({ one }) => ({
  parentRegion: one(regionTable, {
    fields: [regionTable.parentRegionId],
    references: [regionTable.id],
    relationName: 'childToParentRegion'
  })
}))

export const kbVillageTable = mysqlTable(
  'kb_village_table',
  {
    id: varchar({ length: 8 }).references(() => regionTable.id),
    handler: varchar({ length: 255 })
  },
  (table) => [primaryKey({ columns: [table.id] })]
)
