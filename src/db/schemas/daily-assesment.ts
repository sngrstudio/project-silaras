import {
  mysqlTable,
  varchar,
  date,
  boolean,
  tinyint
} from 'drizzle-orm/mysql-core'
import { monthlyAssesment } from './monthly-assesment'
import { sql, type SQL } from 'drizzle-orm'

export const dailyAssesment = mysqlTable('daily_assesment', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .notNull()
    .$default(() => Bun.randomUUIDv7()),
  monthId: varchar('month_id', { length: 255 })
    .notNull()
    .references(() => monthlyAssesment.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  date: date('date').notNull(),
  menu1: varchar('menu_1', { length: 255 }),
  menu2: varchar('menu_2', { length: 255 }),
  containsStapleFood: boolean('contains_staple_food').default(false),
  containsSideDish: boolean('contains_side_dish').default(false),
  containsVegetables: boolean('contains_vegetables').default(false),
  containsFruits: boolean('contains_fruits').default(false),
  isFollowingRecipe: boolean('is_following_recipe').default(false),
  score: tinyint('score').generatedAlwaysAs(
    (): SQL =>
      sql<number>`${dailyAssesment.containsStapleFood} + ${dailyAssesment.containsSideDish} + ${dailyAssesment.containsVegetables} + ${dailyAssesment.containsFruits} + ${dailyAssesment.isFollowingRecipe}`
  )
})
