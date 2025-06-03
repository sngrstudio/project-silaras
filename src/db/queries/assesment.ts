import { db } from '../db'
import {
  monthlyAssesment,
  dailyAssesment,
  targetDailyAssesment,
  targetMonthlyAssesment,
  targetMonthlyAssesmentWithTotalScore
} from '../schemas/assesment'
import { target } from '../schemas/target'
import { user } from '../schemas/user'
import { eq, and, sql } from 'drizzle-orm'

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
  // Use a single upsert operation and return with subquery
  await db
    .insert(monthlyAssesment)
    .values({ month })
    .onDuplicateKeyUpdate({ set: { month } })

  return await db
    .select()
    .from(monthlyAssesment)
    .where(eq(monthlyAssesment.month, month))
    .limit(1)
    .then((rows) => {
      if (!rows[0]) throw new Error('Failed to upsert monthly assessment')
      return rows[0]
    })
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
  // Use single upsert operation
  await db
    .insert(dailyAssesment)
    .values({ monthlyAssesmentId, date, menu1, menu2 })
    .onDuplicateKeyUpdate({ set: { date, menu1, menu2 } })

  return await db
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
    .then((rows) => {
      if (!rows[0]) throw new Error('Failed to upsert daily assessment')
      return rows[0]
    })
}

/**
 * Upsert (insert or update) a target's daily assessment result.
 *
 * This function will insert a new row into the targetDailyAssesment table if one does not exist for the given
 * targetId and dailyAssesmentId, or update the existing row if it does. The upsert is performed using MySQL's
 * ON DUPLICATE KEY UPDATE pattern, as recommended by Drizzle ORM for MySQL compatibility.
 *
 * @param {Object} params - The upsert parameters.
 * @param {string} params.targetId - The ID of the target.
 * @param {string} params.dailyAssesmentId - The ID of the daily assessment definition.
 * @param {boolean} params.containsStapleFood - Whether the assessment contains staple food.
 * @param {boolean} params.containsSideDish - Whether the assessment contains a side dish.
 * @param {boolean} params.containsVegetables - Whether the assessment contains vegetables.
 * @param {boolean} params.containsFruits - Whether the assessment contains fruits.
 * @param {boolean} params.isFollowingRecipe - Whether the assessment follows the recipe.
 *
 * @returns {Promise<object|undefined>} The upserted or updated targetDailyAssesment row, or undefined if not found.
 *
 * @example
 * await upsertTargetDailyAssesment({
 *   targetId: 'abc123',
 *   dailyAssesmentId: 'def456',
 *   containsStapleFood: true,
 *   containsSideDish: false,
 *   containsVegetables: true,
 *   containsFruits: false,
 *   isFollowingRecipe: true
 * })
 */
export async function upsertTargetDailyAssesment({
  targetId,
  dailyAssesmentId,
  containsStapleFood,
  containsSideDish,
  containsVegetables,
  containsFruits,
  isFollowingRecipe,
  lastModifiedBy,
  image
}: {
  targetId: string
  dailyAssesmentId: string
  containsStapleFood: boolean
  containsSideDish: boolean
  containsVegetables: boolean
  containsFruits: boolean
  isFollowingRecipe: boolean
  lastModifiedBy: string
  image?: string | null
}) {
  // Check if any boolean field is true to determine isCompleted
  const hasAnyTrue =
    containsStapleFood ||
    containsSideDish ||
    containsVegetables ||
    containsFruits ||
    isFollowingRecipe

  // Get existing record to check current isCompleted status
  const existing = await db
    .select({ isCompleted: targetDailyAssesment.isCompleted })
    .from(targetDailyAssesment)
    .where(
      and(
        eq(targetDailyAssesment.targetId, targetId),
        eq(targetDailyAssesment.dailyAssesmentId, dailyAssesmentId)
      )
    )
    .limit(1)
    .then((rows) => rows[0])

  // isCompleted should be true if:
  // 1. Any current field is true, OR
  // 2. It was already true in the existing record (never revert to false)
  const isCompleted = hasAnyTrue || (existing?.isCompleted ?? false)

  // Prepare the update data - only include image if it's explicitly provided
  const updateData: any = {
    containsStapleFood,
    containsSideDish,
    containsVegetables,
    containsFruits,
    isFollowingRecipe,
    isCompleted,
    lastModifiedBy,
    lastModifiedAt: new Date() // Always timestamp when updating
  }

  // Only update image if explicitly provided (even if null, to clear it)
  if (image !== undefined) {
    updateData.image = image
  }

  // MySQL upsert using onDuplicateKeyUpdate
  await db
    .insert(targetDailyAssesment)
    .values({
      targetId,
      dailyAssesmentId,
      containsStapleFood,
      containsSideDish,
      containsVegetables,
      containsFruits,
      isFollowingRecipe,
      isCompleted,
      lastModifiedBy,
      lastModifiedAt: new Date(), // Always timestamp when inserting
      image: image || null // Ensure null for initial insert if no image
    })
    .onDuplicateKeyUpdate({
      set: updateData
    })

  // Return the upserted row
  const [row] = await db
    .select()
    .from(targetDailyAssesment)
    .where(
      and(
        eq(targetDailyAssesment.targetId, targetId),
        eq(targetDailyAssesment.dailyAssesmentId, dailyAssesmentId)
      )
    )
    .limit(1)

  return row
}

/**
 * Get all daily assessments for a target (by slug) and month.
 *
 * Returns an array of daily assessment results for the given target and month, including both the assessment
 * definition (date, menu1, menu2) and the target's results (booleans and score). Uses a single SQL query with joins.
 *
 * @param {Object} params - The query parameters.
 * @param {string} params.targetSlug - The slug of the target.
 * @param {Month} params.month - The month name (enum).
 * @returns {Promise<Array<object>>} Array of daily assessment results for the target and month.
 *
 * @example
 * await getAllDailyAssesmentsByTargetAndMonth({ targetSlug: 'john-doe', month: 'JUNE' })
 */
export async function getAllDailyAssesmentsByTargetAndMonth({
  targetSlug,
  month
}: {
  targetSlug: string
  month: Month
}) {
  // Single query with subqueries to get all daily assessment results
  return await db
    .select({
      targetId: targetDailyAssesment.targetId,
      dailyAssesmentId: targetDailyAssesment.dailyAssesmentId,
      date: dailyAssesment.date,
      menu1: dailyAssesment.menu1,
      menu2: dailyAssesment.menu2,
      containsStapleFood: targetDailyAssesment.containsStapleFood,
      containsSideDish: targetDailyAssesment.containsSideDish,
      containsVegetables: targetDailyAssesment.containsVegetables,
      containsFruits: targetDailyAssesment.containsFruits,
      isFollowingRecipe: targetDailyAssesment.isFollowingRecipe,
      score: targetDailyAssesment.score,
      isCompleted: targetDailyAssesment.isCompleted,
      image: targetDailyAssesment.image,
      lastModifiedAt: targetDailyAssesment.lastModifiedAt,
      lastModifiedBy: targetDailyAssesment.lastModifiedBy,
      lastModifiedByUser: {
        id: user.id,
        fullName: user.fullName,
        username: user.username
      }
    })
    .from(targetDailyAssesment)
    .innerJoin(
      dailyAssesment,
      eq(targetDailyAssesment.dailyAssesmentId, dailyAssesment.id)
    )
    .innerJoin(
      monthlyAssesment,
      and(
        eq(dailyAssesment.monthlyAssesmentId, monthlyAssesment.id),
        eq(monthlyAssesment.month, month)
      )
    )
    .leftJoin(user, eq(targetDailyAssesment.lastModifiedBy, user.id))
    .where(
      eq(
        targetDailyAssesment.targetId,
        db
          .select({ id: target.id })
          .from(target)
          .where(eq(target.slug, targetSlug))
          .limit(1)
      )
    )
}

/**
 * Get a target's monthly assessment summary (including total score and BMI) by targetSlug and month name.
 * Returns a single row from the targetMonthlyAssesmentWithTotalScore view, or null if not found.
 *
 * @param {Object} params - The query parameters.
 * @param {string} params.targetSlug - The slug of the target.
 * @param {Month} params.month - The month name (enum).
 * @returns {Promise<object|null>} The monthly assessment summary row, or null if not found.
 */
export async function getMonthlyAssesment({
  targetSlug,
  month
}: {
  targetSlug: string
  month: Month
}) {
  // Query the view for this target and month using a subquery for targetId
  const rows = await db
    .select()
    .from(targetMonthlyAssesmentWithTotalScore)
    .where(
      and(
        eq(
          targetMonthlyAssesmentWithTotalScore.targetId,
          db
            .select({ id: target.id })
            .from(target)
            .where(eq(target.slug, targetSlug))
            .limit(1)
        ),
        eq(targetMonthlyAssesmentWithTotalScore.month, month)
      )
    )
    .limit(1)
  return rows[0] ?? undefined
}

/**
 * Upsert (insert or update) a target's monthly assessment result by targetSlug and month name.
 * Uses subqueries for targetId and monthlyAssesmentId, and returns the new/updated row in a single call.
 *
 * @param {Object} params - The upsert parameters.
 * @param {string} params.targetSlug - The slug of the target.
 * @param {Month} params.month - The month name (enum).
 * @param {number} params.weight - The target's weight.
 * @param {number} params.height - The target's height.
 * @returns {Promise<object|null>} The upserted or updated row, or null if not found.
 */
export async function upsertTargetMonthlyAssesment({
  targetId,
  monthlyAssesmentId,
  weight,
  height
}: {
  targetId: string
  monthlyAssesmentId: string
  weight: number
  height: number
}) {
  await db
    .insert(targetMonthlyAssesment)
    .values({
      targetId,
      monthlyAssesmentId,
      weight,
      height
    })
    .onDuplicateKeyUpdate({ set: { weight, height } })

  // Return the upserted row from the view (with totalScore, bmi, etc)
  const [row] = await db
    .select()
    .from(targetMonthlyAssesmentWithTotalScore)
    .where(
      and(
        eq(targetMonthlyAssesmentWithTotalScore.targetId, targetId),
        eq(
          targetMonthlyAssesmentWithTotalScore.monthlyAssesmentId,
          monthlyAssesmentId
        )
      )
    )
    .limit(1)
  return row ?? undefined
}

/**
 * Get all daily assessment definitions for a given month name.
 *
 * @param {Month} month - The month name (enum: 'JANUARY', 'FEBRUARY', ...).
 * @returns {Promise<Array<object>>} Array of daily assessment definitions for the month.
 */
export async function getDailyAssesments(month: Month) {
  // Use subquery for monthlyAssesmentId by month name
  return await db
    .select()
    .from(dailyAssesment)
    .where(
      eq(
        dailyAssesment.monthlyAssesmentId,
        db
          .select({ id: monthlyAssesment.id })
          .from(monthlyAssesment)
          .where(eq(monthlyAssesment.month, month))
          .limit(1)
      )
    )
}

/**
 * Get completion progress for a target in a specific month.
 * Returns the percentage of completed daily assessments and total/completed counts.
 *
 * @param {Object} params - The query parameters.
 * @param {string} params.targetSlug - The slug of the target.
 * @param {Month} params.month - The month name (enum).
 * @returns {Promise<Object>} Object containing progress percentage and counts.
 *
 * @example
 * await getTargetCompletionProgress({ targetSlug: 'john-doe', month: 'JUNE' })
 * // Returns: { completed: 15, total: 30, percentage: 50 }
 */
export async function getTargetCompletionProgress({
  targetSlug,
  month
}: {
  targetSlug: string
  month: Month
}) {
  // Get total daily assessments for the month
  const totalDailyAssessments = await db
    .select({ count: sql<number>`COUNT(*)`.as('count') })
    .from(dailyAssesment)
    .where(
      eq(
        dailyAssesment.monthlyAssesmentId,
        db
          .select({ id: monthlyAssesment.id })
          .from(monthlyAssesment)
          .where(eq(monthlyAssesment.month, month))
          .limit(1)
      )
    )

  // Get completed daily assessments for the target
  const completedAssessments = await db
    .select({ count: sql<number>`COUNT(*)`.as('count') })
    .from(targetDailyAssesment)
    .innerJoin(
      dailyAssesment,
      eq(targetDailyAssesment.dailyAssesmentId, dailyAssesment.id)
    )
    .innerJoin(
      monthlyAssesment,
      and(
        eq(dailyAssesment.monthlyAssesmentId, monthlyAssesment.id),
        eq(monthlyAssesment.month, month)
      )
    )
    .where(
      and(
        eq(
          targetDailyAssesment.targetId,
          db
            .select({ id: target.id })
            .from(target)
            .where(eq(target.slug, targetSlug))
            .limit(1)
        ),
        eq(targetDailyAssesment.isCompleted, true)
      )
    )

  const total = totalDailyAssessments[0]?.count || 0
  const completed = completedAssessments[0]?.count || 0
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    completed,
    total,
    percentage
  }
}

/**
 * Get comparison data for a target's current vs previous month metrics.
 * If it's the first month, compare with initial values.
 *
 * @param {Object} params - The query parameters.
 * @param {string} params.targetSlug - The slug of the target.
 * @param {Month} params.currentMonth - The current month name.
 * @returns {Promise<Object>} Object containing current and comparison metrics.
 */
export async function getTargetMetricsComparison({
  targetSlug,
  currentMonth
}: {
  targetSlug: string
  currentMonth: Month
}) {
  const currentMonthIndex = MONTHS.indexOf(currentMonth)
  const previousMonth =
    currentMonthIndex > 0 ? MONTHS[currentMonthIndex - 1] : null

  // Get target initial data
  const targetData = await db
    .select({
      initialWeight: target.initialWeight,
      initialHeight: target.initialHeight,
      initialBMI: target.initialBMI
    })
    .from(target)
    .where(eq(target.slug, targetSlug))
    .limit(1)

  if (!targetData[0]) {
    throw new Error('Target not found')
  }

  // Get current month data
  const currentData = await getMonthlyAssesment({
    targetSlug,
    month: currentMonth
  })

  // Get previous month data if exists
  let previousData = null
  if (previousMonth) {
    previousData = await getMonthlyAssesment({
      targetSlug,
      month: previousMonth
    })
  }

  // Calculate deltas
  const weightDelta = currentData
    ? currentData.weight - (previousData?.weight || targetData[0].initialWeight)
    : 0
  const heightDelta = currentData
    ? currentData.height - (previousData?.height || targetData[0].initialHeight)
    : 0
  const bmiDelta =
    currentData && currentData.bmi
      ? currentData.bmi - (previousData?.bmi || targetData[0].initialBMI || 0)
      : 0

  // Get current month total score
  const currentScore = Number(currentData?.totalScore || 0)

  // Get previous month total score
  const previousScore = previousData?.totalScore
    ? Number(previousData.totalScore)
    : null

  // Calculate score delta
  const scoreDelta = previousScore !== null ? currentScore - previousScore : 0

  return {
    current: currentData,
    previous: previousData,
    initial: targetData[0],
    deltas: {
      weight: weightDelta,
      height: heightDelta,
      bmi: bmiDelta,
      score: scoreDelta
    },
    isFirstMonth: !previousMonth || !previousData,
    currentScore: currentScore,
    previousScore: previousScore
  }
}
