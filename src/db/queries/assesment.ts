import { db } from '../db'
import { monthlyAssesment, dailyAssesment } from '../schemas/assesment'
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
 * Upsert a monthly assessment definition (by month name).
 * Returns the upserted or found row.
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
 * Upsert a daily assessment definition (by monthlyAssesmentId, date, menu1, menu2).
 * Returns the upserted or found row.
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
