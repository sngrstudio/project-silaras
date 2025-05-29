import { mysqlTable, varchar, int, datetime } from 'drizzle-orm/mysql-core'
import { randomUUID } from 'crypto'
import { region } from './region'

export const user = mysqlTable('user', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .notNull()
    .$default(() => randomUUID()),
  username: varchar('username', { length: 255 }).notNull().unique(),
  accessLevel: int('access_level').notNull().default(2),
  passwordHash: varchar('password_hash', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 32 }).unique(),
  profilePhoto: varchar('profile_photo', { length: 255 }),
  regionId: varchar('region_id', { length: 36 })
    .notNull()
    .references(() => region.id, {
      onDelete: 'no action',
      onUpdate: 'no action'
    })
})

export const session = mysqlTable('session', {
  id: varchar('id', { length: 255 }).primaryKey().notNull(),
  userId: varchar('user_id', { length: 36 }).references(() => user.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }),
  expiresAt: datetime('expires_at', { mode: 'date' }).notNull()
})
