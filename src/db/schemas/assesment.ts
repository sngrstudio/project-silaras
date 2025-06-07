import {
  mysqlView,
  mysqlTable,
  varchar,
  double,
  date,
  boolean,
  tinyint,
  timestamp,
  primaryKey,
  foreignKey
} from 'drizzle-orm/mysql-core'
import { eq, sum, sql, type SQL } from 'drizzle-orm'
import { target } from './target'
import { user } from './user'

/**
 * Table: monthlyAssesment
 * Stores the definition of each monthly assessment period (e.g., January, February, etc.).
 * Each row represents a unique month for which assessments are defined.
 */
export const monthlyAssesment = mysqlTable('monthly_assesment', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .notNull()
    .$default(() => sql`(UUID())`),
  month: varchar('month', {
    length: 255,
    enum: [
      'JANUARY',
      'FEBRUARY',
      'MARCH',
      'APRIL',
      'MAY',
      'JUNE',
      'JULY',
      'AUGUST',
      'SEPTEMBER',
      'OCTOBER',
      'NOVEMBER',
      'DECEMBER'
    ]
  }).notNull()
})

/**
 * Table: targetMonthlyAssesment
 * Join table linking targets to monthly assessments, logging target-specific weight and height for each month.
 * Composite primary key: (targetId, monthlyAssesmentId).
 */
export const targetMonthlyAssesment = mysqlTable(
  'target_monthly_assesment',
  {
    targetId: varchar('target_id', { length: 36 }).notNull(),
    monthlyAssesmentId: varchar('monthly_assesment_id', {
      length: 36
    }).notNull(),
    weight: double('weight', { precision: 5, scale: 2 }).notNull(),
    height: double('height', { precision: 5, scale: 2 }).notNull(),
    bmi: double('bmi', { precision: 5, scale: 2 }).generatedAlwaysAs(
      (): SQL =>
        sql<number>`${targetMonthlyAssesment.weight} / pow(${targetMonthlyAssesment.height} / 100, 2)`,
      { mode: 'stored' }
    )
  },
  (table) => [
    primaryKey({ columns: [table.targetId, table.monthlyAssesmentId] }),
    foreignKey({
      columns: [table.targetId],
      foreignColumns: [target.id],
      name: 'fk_target_monthly_target'
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    foreignKey({
      columns: [table.monthlyAssesmentId],
      foreignColumns: [monthlyAssesment.id],
      name: 'fk_target_monthly_monthly'
    })
      .onDelete('cascade')
      .onUpdate('cascade')
  ]
)

/**
 * Table: dailyAssesment
 * Stores the definition of each daily assessment, including the date and menu for that day.
 * Each daily assessment is linked to a monthly assessment.
 */
export const dailyAssesment = mysqlTable(
  'daily_assesment',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .notNull()
      .$default(() => sql`(UUID())`),
    monthlyAssesmentId: varchar('monthly_assesment_id', {
      length: 36
    }).notNull(),
    date: date('date').unique().notNull(),
    menu1: varchar('menu_1', { length: 255 }).notNull(),
    menu2: varchar('menu_2', { length: 255 }).notNull()
  },
  (table) => [
    foreignKey({
      columns: [table.monthlyAssesmentId],
      foreignColumns: [monthlyAssesment.id],
      name: 'fk_daily_monthly'
    })
      .onDelete('cascade')
      .onUpdate('cascade')
  ]
)

/**
 * Table: targetDailyAssesment
 * Join table linking targets to daily assessments, logging target-specific boolean results for each assessment.
 * Includes a generated score column that sums the boolean fields.
 * Composite primary key: (targetId, dailyAssesmentId).
 */
export const targetDailyAssesment = mysqlTable(
  'target_daily_assesment',
  {
    targetId: varchar('target_id', { length: 36 }).notNull(),
    dailyAssesmentId: varchar('daily_assesment_id', { length: 36 }).notNull(),
    containsStapleFood: boolean('contains_staple_food').default(false),
    containsSideDish: boolean('contains_side_dish').default(false),
    containsVegetables: boolean('contains_vegetables').default(false),
    containsFruits: boolean('contains_fruits').default(false),
    isFollowingRecipe: boolean('is_following_recipe').default(false),
    score: tinyint('score', { unsigned: true }).generatedAlwaysAs(
      (): SQL =>
        sql<number>`${targetDailyAssesment.containsStapleFood} + ${targetDailyAssesment.containsSideDish} + ${targetDailyAssesment.containsVegetables} + ${targetDailyAssesment.containsFruits} + ${targetDailyAssesment.isFollowingRecipe}`,
      { mode: 'stored' }
    ),
    isCompleted: boolean('is_completed').default(false).notNull(),
    image: varchar('image', { length: 255 }),
    lastModifiedAt: timestamp('last_modified_at'),
    lastModifiedBy: varchar('last_modified_by', { length: 36 })
  },
  (table) => [
    primaryKey({ columns: [table.targetId, table.dailyAssesmentId] }),
    foreignKey({
      columns: [table.targetId],
      foreignColumns: [target.id],
      name: 'fk_target_daily_target'
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    foreignKey({
      columns: [table.dailyAssesmentId],
      foreignColumns: [dailyAssesment.id],
      name: 'fk_target_daily_daily'
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    foreignKey({
      columns: [table.lastModifiedBy],
      foreignColumns: [user.id],
      name: 'fk_target_daily_last_modified_by'
    })
      .onDelete('restrict')
      .onUpdate('cascade')
  ]
)

/**
 * View: targetMonthlyAssesmentWithTotalScore
 * Drizzle ORM view that joins targetMonthlyAssesment, monthlyAssesment, and aggregates totalScore from targetDailyAssesment for each (targetId, monthlyAssesmentId).
 * Uses Drizzle's query builder, not raw SQL.
 */
export const targetMonthlyAssesmentWithTotalScore = mysqlView(
  'target_monthly_assesment_with_total_score'
).as((db) =>
  db
    .select({
      targetId: targetMonthlyAssesment.targetId,
      monthlyAssesmentId: targetMonthlyAssesment.monthlyAssesmentId,
      weight: targetMonthlyAssesment.weight,
      height: targetMonthlyAssesment.height,
      bmi: targetMonthlyAssesment.bmi,
      month: monthlyAssesment.month,
      totalScore: sum(targetDailyAssesment.score).as('total_score')
    })
    .from(targetMonthlyAssesment)
    .innerJoin(
      monthlyAssesment,
      eq(targetMonthlyAssesment.monthlyAssesmentId, monthlyAssesment.id)
    )
    .leftJoin(
      targetDailyAssesment,
      eq(targetMonthlyAssesment.targetId, targetDailyAssesment.targetId)
    )
    .leftJoin(
      dailyAssesment,
      eq(targetDailyAssesment.dailyAssesmentId, dailyAssesment.id)
    )
    .where(
      eq(
        targetMonthlyAssesment.monthlyAssesmentId,
        dailyAssesment.monthlyAssesmentId
      )
    )
    .groupBy(
      targetMonthlyAssesment.targetId,
      targetMonthlyAssesment.monthlyAssesmentId,
      targetMonthlyAssesment.weight,
      targetMonthlyAssesment.height,
      targetMonthlyAssesment.bmi,
      monthlyAssesment.month
    )
)
