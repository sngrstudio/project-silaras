import { eq } from 'drizzle-orm'
import {
  mysqlTable,
  mysqlView,
  primaryKey,
  varchar,
  int,
  datetime,
  text
} from 'drizzle-orm/mysql-core'

export const userTable = mysqlTable('user', {
  id: varchar({ length: 255 })
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  userName: varchar('user_name', { length: 255 }).unique().notNull(),
  accessLevel: int('access_level')
    .notNull()
    .references(() => accessLevelMapTable.id),
  passwordHash: varchar('password_hash', { length: 255 }).notNull()
})

export const sessionTable = mysqlTable('session', {
  id: varchar({ length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => userTable.id),
  expiresAt: datetime('expires_at').notNull()
})

export const userProfileTable = mysqlTable(
  'user_profile',
  {
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => userTable.id),
    fullName: text('full_name').notNull(),
    phoneNumber: text('phone_number').unique(),
    profilePhoto: text('profile_photo')
  },
  (t) => [primaryKey({ columns: [t.userId] })]
)

export const accessLevelMapTable = mysqlTable('access_level_map', {
  id: int().autoincrement().primaryKey(),
  description: text().notNull()
})

export const userView = mysqlView('user_view').as((qb) => {
  return qb
    .select({
      userId: userTable.id,
      userName: userTable.userName,
      fullName: userProfileTable.fullName,
      phoneNumber: userProfileTable.phoneNumber,
      profilePhoto: userProfileTable.profilePhoto
    })
    .from(userTable)
    .innerJoin(userProfileTable, eq(userProfileTable.userId, userTable.id))
})
