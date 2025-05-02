import {
  mysqlTable,
  mysqlView,
  primaryKey,
  varchar,
  text
} from 'drizzle-orm/mysql-core'
import { userTable } from './auth'
import { eq } from 'drizzle-orm'

export const userProfileTable = mysqlTable(
  'user_profile',
  {
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    fullName: text('full_name'),
    phoneNumber: text()
  },
  (t) => [primaryKey({ columns: [t.userId] })]
)

export const userProfileView = mysqlView('user_profile_view').as((qb) =>
  qb
    .select({
      userName: userTable.userName,
      role: userTable.role,
      fullName: userProfileTable.fullName,
      phoneNumber: userProfileTable.phoneNumber
    })
    .from(userTable)
    .innerJoin(userProfileTable, eq(userProfileTable.userId, userTable.id))
)
