import {
  mysqlTable,
  mysqlEnum,
  varchar,
  datetime
} from 'drizzle-orm/mysql-core'

export const userTable = mysqlTable('user', {
  id: varchar({ length: 255 })
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  userName: varchar('user_name', { length: 255 }).unique().notNull(),
  role: mysqlEnum([
    'SUPER_ADMINISTRATOR',
    'ADMINISTRATOR',
    'USER',
    'VIEWER'
  ]).notNull(),
  passwordHash: varchar('password_hash', { length: 255 })
})

export const sessionTable = mysqlTable('session', {
  id: varchar({ length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => userTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  expiresAt: datetime('expires_at').notNull()
})
