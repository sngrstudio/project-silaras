import { db } from '../db'
import {
  monthlyAssesment,
  dailyAssesment,
  patientDailyAssesment
} from '../schemas/assesment'
import { patient } from '../schemas/patient'
import { eq, and } from 'drizzle-orm'

export const MONTHS = [
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
] as const
export type Month = (typeof MONTHS)[number]

/**
 * Upsert (insert or update) a monthly assessment definition by month name.
 *
 * If a monthly assessment for the given month already exists, it will be updated (MySQL upsert).
 *
 * @param {Month} month - The month name (enum: 'JANUARY', 'FEBRUARY', ...).
 * @returns {Promise<object>} The upserted or found monthly assessment row.
 * @throws {Error} If the upsert fails.
 *
 * @example
 * await upsertMonthlyAssesment('JUNE')
 */
export async function upsertMonthlyAssesment(month: Month) {
  // Try to find existing
  const existing = await db
    .select()
    .from(monthlyAssesment)
    .where(eq(monthlyAssesment.month, month))
    .limit(1)
  if (existing.length > 0) return existing[0]
  // Insert new or update if exists (MySQL upsert)
  await db
    .insert(monthlyAssesment)
    .values({ month })
    .onDuplicateKeyUpdate({ set: { month } })
  const [inserted] = await db
    .select()
    .from(monthlyAssesment)
    .where(eq(monthlyAssesment.month, month))
    .limit(1)
  if (!inserted) throw new Error('Failed to upsert monthly assessment')
  return inserted
}

/**
 * Upsert (insert or update) a daily assessment definition by monthlyAssesmentId, date, menu1, and menu2.
 *
 * If a daily assessment for the given keys already exists, it will be updated (MySQL upsert).
 *
 * @param {Object} params - The upsert parameters.
 * @param {string} params.monthlyAssesmentId - The ID of the monthly assessment.
 * @param {Date} params.date - The date of the daily assessment.
 * @param {string} params.menu1 - The first menu for the day.
 * @param {string} params.menu2 - The second menu for the day.
 * @returns {Promise<object>} The upserted or found daily assessment row.
 * @throws {Error} If the upsert fails.
 *
 * @example
 * await upsertDailyAssesment({
 *   monthlyAssesmentId: 'abc123',
 *   date: new Date('2025-06-01'),
 *   menu1: 'Nasi',
 *   menu2: 'Ayam'
 * })
 */
export async function upsertDailyAssesment({
  monthlyAssesmentId,
  date,
  menu1,
  menu2
}: {
  monthlyAssesmentId: string
  date: Date
  menu1: string
  menu2: string
}) {
  // Try to find existing
  const existing = await db
    .select()
    .from(dailyAssesment)
    .where(
      and(
        eq(dailyAssesment.monthlyAssesmentId, monthlyAssesmentId),
        eq(dailyAssesment.date, date),
        eq(dailyAssesment.menu1, menu1),
        eq(dailyAssesment.menu2, menu2)
      )
    )
    .limit(1)
  if (existing.length > 0) return existing[0]
  // Insert new or update if exists (MySQL upsert)
  await db
    .insert(dailyAssesment)
    .values({ monthlyAssesmentId, date, menu1, menu2 })
    .onDuplicateKeyUpdate({ set: { menu1, menu2 } })
  const [inserted] = await db
    .select()
    .from(dailyAssesment)
    .where(
      and(
        eq(dailyAssesment.monthlyAssesmentId, monthlyAssesmentId),
        eq(dailyAssesment.date, date),
        eq(dailyAssesment.menu1, menu1),
        eq(dailyAssesment.menu2, menu2)
      )
    )
    .limit(1)
  if (!inserted) throw new Error('Failed to upsert daily assessment')
  return inserted
}

/**
 * Upsert (insert or update) a patient's daily assessment result.
 *
 * This function will insert a new row into the patientDailyAssesment table if one does not exist for the given
 * patientId and dailyAssesmentId, or update the existing row if it does. The upsert is performed using MySQL's
 * ON DUPLICATE KEY UPDATE pattern, as recommended by Drizzle ORM for MySQL compatibility.
 *
 * @param {Object} params - The upsert parameters.
 * @param {string} params.patientId - The ID of the patient.
 * @param {string} params.dailyAssesmentId - The ID of the daily assessment definition.
 * @param {boolean} params.containsStapleFood - Whether the assessment contains staple food.
 * @param {boolean} params.containsSideDish - Whether the assessment contains a side dish.
 * @param {boolean} params.containsVegetables - Whether the assessment contains vegetables.
 * @param {boolean} params.containsFruits - Whether the assessment contains fruits.
 * @param {boolean} params.isFollowingRecipe - Whether the assessment follows the recipe.
 *
 * @returns {Promise<object|undefined>} The upserted or updated patientDailyAssesment row, or undefined if not found.
 *
 * @example
 * await upsertPatientDailyAssesment({
 *   patientId: 'abc123',
 *   dailyAssesmentId: 'def456',
 *   containsStapleFood: true,
 *   containsSideDish: false,
 *   containsVegetables: true,
 *   containsFruits: false,
 *   isFollowingRecipe: true
 * })
 */
export async function upsertPatientDailyAssesment({
  patientId,
  dailyAssesmentId,
  containsStapleFood,
  containsSideDish,
  containsVegetables,
  containsFruits,
  isFollowingRecipe
}: {
  patientId: string
  dailyAssesmentId: string
  containsStapleFood: boolean
  containsSideDish: boolean
  containsVegetables: boolean
  containsFruits: boolean
  isFollowingRecipe: boolean
}) {
  // MySQL upsert using onDuplicateKeyUpdate
  await db
    .insert(patientDailyAssesment)
    .values({
      patientId,
      dailyAssesmentId,
      containsStapleFood,
      containsSideDish,
      containsVegetables,
      containsFruits,
      isFollowingRecipe
    })
    .onDuplicateKeyUpdate({
      set: {
        containsStapleFood,
        containsSideDish,
        containsVegetables,
        containsFruits,
        isFollowingRecipe
      }
    })
  // Return the upserted row
  const [row] = await db
    .select()
    .from(patientDailyAssesment)
    .where(
      and(
        eq(patientDailyAssesment.patientId, patientId),
        eq(patientDailyAssesment.dailyAssesmentId, dailyAssesmentId)
      )
    )
    .limit(1)
  return row
}

/**
 * Get all daily assessments for a patient (by slug) and month.
 *
 * Returns an array of daily assessment results for the given patient and month, including both the assessment
 * definition (date, menu1, menu2) and the patient's results (booleans and score). Uses a SQL JOIN for efficiency.
 *
 * @param {Object} params - The query parameters.
 * @param {string} params.patientSlug - The slug of the patient.
 * @param {Month} params.month - The month name (enum).
 * @returns {Promise<Array<object>>} Array of daily assessment results for the patient and month.
 *
 * @example
 * await getAllDailyAssesmentsByPatientAndMonth({ patientSlug: 'john-doe', month: 'JUNE' })
 */
export async function getAllDailyAssesmentsByPatientAndMonth({
  patientSlug,
  month
}: {
  patientSlug: string
  month: Month
}) {
  // Get patient id by slug
  const patientRow = await db
    .select({ id: patient.id })
    .from(patient)
    .where(eq(patient.slug, patientSlug))
    .then((rows) => rows[0] ?? null)
  if (!patientRow) return []

  // Get monthly assessment id by month
  const monthly = await db
    .select({ id: monthlyAssesment.id })
    .from(monthlyAssesment)
    .where(eq(monthlyAssesment.month, month))
    .then((rows) => rows[0] ?? null)
  if (!monthly) return []

  // Get all daily assessment ids for this month
  const dailyDefs = await db
    .select({ id: dailyAssesment.id })
    .from(dailyAssesment)
    .where(eq(dailyAssesment.monthlyAssesmentId, monthly.id))

  if (!dailyDefs.length) return []

  // Get all patient daily assessment results for this patient and these daily definitions using a JOIN
  const results = await db
    .select({
      patientId: patientDailyAssesment.patientId,
      dailyAssesmentId: patientDailyAssesment.dailyAssesmentId,
      date: dailyAssesment.date,
      menu1: dailyAssesment.menu1,
      menu2: dailyAssesment.menu2,
      containsStapleFood: patientDailyAssesment.containsStapleFood,
      containsSideDish: patientDailyAssesment.containsSideDish,
      containsVegetables: patientDailyAssesment.containsVegetables,
      containsFruits: patientDailyAssesment.containsFruits,
      isFollowingRecipe: patientDailyAssesment.isFollowingRecipe,
      score: patientDailyAssesment.score
    })
    .from(patientDailyAssesment)
    .innerJoin(
      dailyAssesment,
      and(
        eq(patientDailyAssesment.dailyAssesmentId, dailyAssesment.id),
        eq(dailyAssesment.monthlyAssesmentId, monthly.id)
      )
    )
    .where(eq(patientDailyAssesment.patientId, patientRow.id))

  return results
}
