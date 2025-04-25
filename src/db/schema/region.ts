import { mysqlTable, varchar, foreignKey } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

export const regionTable = mysqlTable(
  'region_table',
  {
    id: varchar({ length: 8 }).primaryKey(),
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

export const kbVillageTable = mysqlTable('kb_village_table', {
  id: varchar({ length: 8 })
    .primaryKey()
    .references(() => regionTable.id)
})
