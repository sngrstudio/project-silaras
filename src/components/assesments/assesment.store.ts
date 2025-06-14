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
 * Function to get the default month index based on current date
 * If current month is earlier than July (index 7), return July
 * If current month is later than November (index 11), return November
 * Otherwise, return the current month index
 *
 * Note: Uses 1-based indexing (1=January, 12=December) to match API expectations
 */
const getDefaultMonthIndex = (): number => {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1 // Convert to 1-based: 1=January, 12=December

  // Assessment period: July (7) to November (11)
  const FIRST_MONTH = 7 // July
  const LAST_MONTH = 11 // November

  if (currentMonth < FIRST_MONTH) {
    return FIRST_MONTH // Return July if current month is before July
  } else if (currentMonth > LAST_MONTH) {
    return LAST_MONTH // Return November if current month is after November
  } else {
    return currentMonth // Return current month if it's within the assessment period
  }
}

/**
 * Nanostore for current month index
 * Represents the selected month for assessment viewing (1-12)
 *
 * Month mapping:
 * - 1: January, 2: February, 3: March, 4: April
 * - 5: May, 6: June, 7: July, 8: August
 * - 9: September, 10: October, 11: November, 12: December
 *
 * Assessment period: July (7) to November (11)
 *
 * @default getDefaultMonthIndex() - Current month with fallback to July/November
 */
export const $currentMonthIndex = atom<number>(getDefaultMonthIndex())

/**
 * Setter function for current month index
 * Used to navigate between different months in the assessment interface
 *
 * @param state - Month index (0-11) to set as current
 */
export const setCurrentMonthIndex = (state: number) =>
  $currentMonthIndex.set(state)
