import {
  mysqlTable,
  mysqlView,
  primaryKey,
  foreignKey,
  varchar,
  text,
  mysqlEnum
} from 'drizzle-orm/mysql-core'
import { userProfileTable } from './user'
import { eq } from 'drizzle-orm'

export const regionTable = mysqlTable(
  'region',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    code: varchar({ length: 255 }).unique(),
    name: text(),
    type: mysqlEnum(['DISTRICT', 'SUBDISTRICT', 'VILLAGE'])
      .notNull()
      .default('VILLAGE'),
    parentId: varchar({ length: 255 })
  },
  (t) => [
    foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
      name: 'region_parent_id_id_fk'
    }).onDelete('cascade')
  ]
)

export const villageOnWatchTable = mysqlTable(
  'village_on_watch',
  {
    regionId: varchar({ length: 255 })
      .notNull()
      .references(() => regionTable.id, { onDelete: 'cascade' }),
    userId: varchar({ length: 255 })
      .notNull()
      .references(() => userProfileTable.userId)
  },
  (t) => [primaryKey({ columns: [t.regionId, t.userId] })]
)

export const villageOnWatchView = mysqlView('village_on_watch_view').as((qb) =>
  qb
    .select({
      regionId: regionTable.id,
      userId: userProfileTable.userId,
      regionName: regionTable.name,
      regionCode: regionTable.code,
      handler: userProfileTable.fullName,
      phone: userProfileTable.phoneNumber
    })
    .from(villageOnWatchTable)
    .leftJoin(regionTable, eq(regionTable.id, villageOnWatchTable.regionId))
    .leftJoin(
      userProfileTable,
      eq(userProfileTable.userId, villageOnWatchTable.userId)
    )
)
