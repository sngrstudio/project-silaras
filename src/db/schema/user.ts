import { mysqlTable, primaryKey, varchar } from 'drizzle-orm/mysql-core'
import { userTable } from './auth'

export const userProfileTable = mysqlTable(
  'user_profile',
  {
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      })
  },
  (t) => [primaryKey({ columns: [t.userId] })]
)
