import {
  mysqlTable,
  varchar,
  mysqlEnum,
  type AnyMySqlColumn
} from 'drizzle-orm/mysql-core'

/**
 * Region table schema definition.
 *
 * Fields:
 * - id: string, primary key, generated with Bun.randomUUIDv7()
 * - name: string, region name
 * - slug: string, unique slug for the region
 * - type: enum ('KABUPATEN', 'KECAMATAN', 'DESA')
 * - parentId: string | null, self-referencing foreign key for region hierarchy
 *
 * Hierarchy:
 * - 'KABUPATEN' can have children of type 'KECAMATAN'
 * - 'KECAMATAN' can have children of type 'DESA'
 */

export const region = mysqlTable('region', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .notNull()
    .$default(() => Bun.randomUUIDv7()),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  type: mysqlEnum('type', ['KABUPATEN', 'KECAMATAN', 'DESA']).notNull(),
  parentId: varchar('parent_id', { length: 36 }).references(
    (): AnyMySqlColumn => region.id,
    { onDelete: 'cascade', onUpdate: 'cascade' }
  ) // self-referencing foreign key for hierarchy
})
