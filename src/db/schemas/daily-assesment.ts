import { mysqlTable, varchar, date, boolean } from 'drizzle-orm/mysql-core'
import { monthlyAssesment } from './monthly-assesment'

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
  containsStapleFood: boolean('contains_staple_food'),
  containsSideDish: boolean('contains_side_dish'),
  containsVegetables: boolean('contains_vegetables'),
  containsFruits: boolean('contains_fruits'),
  isFollowingRecipe: boolean('is_following_recipe')
})
