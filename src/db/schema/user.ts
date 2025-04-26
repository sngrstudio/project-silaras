import type { InferSelectModel } from 'drizzle-orm'
import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'
import { kbVillageTable } from './region'
import { nanoid } from 'nanoid'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'astro:schema'

export const userTable = mysqlTable('user_table', {
  id: varchar({ length: 16 })
    .primaryKey()
    .$defaultFn(() => `u_${nanoid(14)}`),
  userName: varchar('user_name', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  kbVillageId: varchar('kb_village_id', { length: 8 }).references(
    () => kbVillageTable.id
  )
})

export const sessionTable = mysqlTable('session_table', {
  id: varchar({ length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 16 })
    .notNull()
    .references(() => userTable.id),
  expiresAt: datetime('expires_at').notNull()
})

export type User = InferSelectModel<typeof userTable>
export type Session = InferSelectModel<typeof sessionTable>

export const userInsertZodSchema = createInsertSchema(userTable).extend({
  password: z.string().min(8),
  confirmPassword: z.string()
})
