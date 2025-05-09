import {
  mysqlTable,
  primaryKey,
  varchar,
  datetime,
  text
} from 'drizzle-orm/mysql-core'

export const userTable = mysqlTable('user', {
  id: varchar({ length: 255 })
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  name: varchar({ length: 255 }).unique().notNull(),
  role: varchar({
    length: 255,
    enum: ['ADMINISTRATOR', 'COORDINATOR', 'USER', 'READONLY']
  }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 })
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
    name: text().notNull(),
    phoneNumber: text('phone_number').unique(),
    profilePhoto: text('profile_photo')
  },
  (t) => [primaryKey({ columns: [t.userId] })]
)
