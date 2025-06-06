import { atom } from 'nanostores'
import { actions } from 'astro:actions'

/**
 * @fileoverview Assessment Store
 *
 * Manages state for daily and monthly assessments within the SILARAS system.
 * This store handles assessment data, pagination, and current month navigation
 * for the assessment management interface.
 *
 * The store maintains:
 * - Daily assessment records with completion status and scoring
 * - Monthly assessment summary data
 * - Current month index for navigation (0-11, where 6 = July as default)
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

/**
 * Type definition for daily assessments data
 * Retrieved from the assessment.daily.getAll action
 */
export type DailyAssesments = Awaited<
  ReturnType<typeof actions.assesment.daily.getAll.orThrow>
>

/**
 * Nanostore for daily assessments data
 * Contains array of daily assessment records for a specific target and month
 *
 * @default [] - Empty array when no assessments are loaded
 */
export const $dailyAssesments = atom<DailyAssesments>([])

/**
 * Setter function for daily assessments state
 * Used to update the store with new assessment data from API calls
 *
 * @param state - New daily assessments data to set
 */
export const setDailyAssesments = (state: DailyAssesments) =>
  $dailyAssesments.set(state)

/**
 * Type definition for monthly assessment data
 * Retrieved from the assessment.monthly.get action
 */
export type MonthlyAssesment = Awaited<
  ReturnType<typeof actions.assesment.monthly.get.orThrow>
>

/**
 * Nanostore for monthly assessment summary data
 * Contains aggregated assessment data for a specific target and month
 *
 * @default undefined - No monthly assessment loaded initially
 */
export const $monthlyAssesments = atom<MonthlyAssesment | undefined>(undefined)

/**
 * Setter function for monthly assessment state
 * Used to update the store with monthly assessment summary data
 *
 * @param state - New monthly assessment data to set, or undefined to clear
 */
export const setMonthlyAssesment = (state: MonthlyAssesment | undefined) =>
  $monthlyAssesments.set(state)

/**
 * Nanostore for current month index
 * Represents the selected month for assessment viewing (0-11)
 *
 * Month mapping:
 * - 0: January, 1: February, 2: March, 3: April
 * - 4: May, 5: June, 6: July (default), 7: August
 * - 8: September, 9: October, 10: November, 11: December
 *
 * @default 6 - July (mid-year default for assessment period)
 */
export const $currentMonthIndex = atom<number>(6)

/**
 * Setter function for current month index
 * Used to navigate between different months in the assessment interface
 *
 * @param state - Month index (0-11) to set as current
 */
export const setCurrentMonthIndex = (state: number) =>
  $currentMonthIndex.set(state)
