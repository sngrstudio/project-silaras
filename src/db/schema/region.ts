import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

export const regionTable = mysqlTable('region_table', {
  id: varchar({ length: 8 }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  parentRegionId: varchar({ length: 8 })
})

export const regionTableRelations = relations(regionTable, ({ one, many }) => ({
  parentRegion: one(regionTable, {
    fields: [regionTable.parentRegionId],
    references: [regionTable.id]
  }),
  childRegions: many(regionTable)
}))
