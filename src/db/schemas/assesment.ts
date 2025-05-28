import {
  mysqlView,
  mysqlTable,
  varchar,
  double,
  date,
  boolean,
  tinyint,
  primaryKey,
  foreignKey
} from 'drizzle-orm/mysql-core'
import { eq, sum, sql, type SQL } from 'drizzle-orm'
import { patient } from './patient'

/**
 * Table: monthlyAssesment
 * Stores the definition of each monthly assessment period (e.g., January, February, etc.).
 * Each row represents a unique month for which assessments are defined.
 */
export const monthlyAssesment = mysqlTable('monthly_assesment', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .notNull()
    .$default(() => Bun.randomUUIDv7()),
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
 * Table: patientMonthlyAssesment
 * Join table linking patients to monthly assessments, logging patient-specific weight and height for each month.
 * Composite primary key: (patientId, monthlyAssesmentId).
 */
export const patientMonthlyAssesment = mysqlTable(
  'patient_monthly_assesment',
  {
    patientId: varchar('patient_id', { length: 255 }).notNull(),
    monthlyAssesmentId: varchar('monthly_assesment_id', {
      length: 255
    }).notNull(),
    weight: double('weight', { precision: 5, scale: 2 }).notNull(),
    height: double('height', { precision: 5, scale: 2 }).notNull(),
    bmi: double('bmi', { precision: 5, scale: 2 }).generatedAlwaysAs(
      (): SQL =>
        sql<number>`${patientMonthlyAssesment.weight} / pow(${patientMonthlyAssesment.height} / 100, 2)`,
      { mode: 'stored' }
    )
  },
  (table) => [
    primaryKey({ columns: [table.patientId, table.monthlyAssesmentId] }),
    foreignKey({
      columns: [table.patientId],
      foreignColumns: [patient.id],
      name: 'fk_patient_monthly_patient'
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    foreignKey({
      columns: [table.monthlyAssesmentId],
      foreignColumns: [monthlyAssesment.id],
      name: 'fk_patient_monthly_monthly'
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
    id: varchar('id', { length: 255 })
      .primaryKey()
      .notNull()
      .$default(() => Bun.randomUUIDv7()),
    monthlyAssesmentId: varchar('monthly_assesment_id', {
      length: 255
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
 * Table: patientDailyAssesment
 * Join table linking patients to daily assessments, logging patient-specific boolean results for each assessment.
 * Includes a generated score column that sums the boolean fields.
 * Composite primary key: (patientId, dailyAssesmentId).
 */
export const patientDailyAssesment = mysqlTable(
  'patient_daily_assesment',
  {
    patientId: varchar('patient_id', { length: 255 }).notNull(),
    dailyAssesmentId: varchar('daily_assesment_id', { length: 255 }).notNull(),
    containsStapleFood: boolean('contains_staple_food').default(false),
    containsSideDish: boolean('contains_side_dish').default(false),
    containsVegetables: boolean('contains_vegetables').default(false),
    containsFruits: boolean('contains_fruits').default(false),
    isFollowingRecipe: boolean('is_following_recipe').default(false),
    score: tinyint('score', { unsigned: true }).generatedAlwaysAs(
      (): SQL =>
        sql<number>`${patientDailyAssesment.containsStapleFood} + ${patientDailyAssesment.containsSideDish} + ${patientDailyAssesment.containsVegetables} + ${patientDailyAssesment.containsFruits} + ${patientDailyAssesment.isFollowingRecipe}`,
      { mode: 'stored' }
    )
  },
  (table) => [
    primaryKey({ columns: [table.patientId, table.dailyAssesmentId] }),
    foreignKey({
      columns: [table.patientId],
      foreignColumns: [patient.id],
      name: 'fk_patient_daily_patient'
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    foreignKey({
      columns: [table.dailyAssesmentId],
      foreignColumns: [dailyAssesment.id],
      name: 'fk_patient_daily_daily'
    })
      .onDelete('cascade')
      .onUpdate('cascade')
  ]
)

/**
 * View: patientMonthlyAssesmentWithTotalScore
 * Drizzle ORM view that joins patientMonthlyAssesment, monthlyAssesment, and aggregates totalScore from patientDailyAssesment for each (patientId, monthlyAssesmentId).
 * Uses Drizzle's query builder, not raw SQL.
 */
export const patientMonthlyAssesmentWithTotalScore = mysqlView(
  'patient_monthly_assesment_with_total_score'
).as((db) =>
  db
    .select({
      patientId: patientMonthlyAssesment.patientId,
      monthlyAssesmentId: patientMonthlyAssesment.monthlyAssesmentId,
      weight: patientMonthlyAssesment.weight,
      height: patientMonthlyAssesment.height,
      bmi: patientMonthlyAssesment.bmi,
      month: monthlyAssesment.month,
      totalScore: sum(patientDailyAssesment.score).as('total_score')
    })
    .from(patientMonthlyAssesment)
    .innerJoin(
      monthlyAssesment,
      eq(patientMonthlyAssesment.monthlyAssesmentId, monthlyAssesment.id)
    )
    .leftJoin(
      patientDailyAssesment,
      eq(patientMonthlyAssesment.patientId, patientDailyAssesment.patientId)
    )
    .leftJoin(
      dailyAssesment,
      eq(patientDailyAssesment.dailyAssesmentId, dailyAssesment.id)
    )
    .where(
      eq(
        patientMonthlyAssesment.monthlyAssesmentId,
        dailyAssesment.monthlyAssesmentId
      )
    )
    .groupBy(
      patientMonthlyAssesment.patientId,
      patientMonthlyAssesment.monthlyAssesmentId,
      patientMonthlyAssesment.weight,
      patientMonthlyAssesment.height,
      patientMonthlyAssesment.bmi,
      monthlyAssesment.month
    )
)
