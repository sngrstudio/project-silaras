import { atom } from 'nanostores'
import { actions } from 'astro:actions'

/**
 * @fileoverview Menu Settings Store
 *
 * Manages state for daily assessment menu configuration within the SILARAS system.
 * This store handles the daily menu settings that define what food items are
 * available for assessment on specific dates, along with month navigation.
 *
 * Features:
 * - Daily menu configuration per date
 * - Month-based filtering and navigation
 * - Menu template management for assessment forms
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

/**
 * Type definition for daily assessment settings data
 * Retrieved from the assesment.settings.getAllDaily action
 * Contains menu configuration for specific dates
 */
export type DailyAssesmentsSettings = Awaited<
  ReturnType<typeof actions.assesment.settings.getAllDaily.orThrow>
>

/**
 * Nanostore for daily assessment menu settings
 * Contains the configuration for daily menus used in assessments
 *
 * Each entry typically includes:
 * - date: The specific date for the menu
 * - mainDish: Primary food item for the day
 * - sideDish: Secondary food item configuration
 * - Other menu-related settings
 *
 * @default [] - Empty array when no menu settings are loaded
 */
export const $dailyAssesmentsSettings = atom<DailyAssesmentsSettings>([])

/**
 * Setter function for daily assessment settings state
 * Used to update the store with new menu settings from API calls
 *
 * @param state - New daily assessment settings data to set
 */
export const setDailyAssesmentsSettings = (state: DailyAssesmentsSettings) =>
  $dailyAssesmentsSettings.set(state)

/**
 * Nanostore for current month index in menu settings
 * Represents the selected month for menu configuration (0-11)
 *
 * Month mapping:
 * - 0: January, 1: February, 2: March, 3: April
 * - 4: May, 5: June, 6: July (default), 7: August
 * - 8: September, 9: October, 10: November, 11: December
 *
 * @default 6 - July (mid-year default for menu configuration period)
 */
export const $currentMonthIndex = atom<number>(6)

/**
 * Setter function for current month index
 * Used to navigate between different months in the menu settings interface
 *
 * @param state - Month index (0-11) to set as current
 */
export const setCurrentMonthIndex = (state: number) =>
  $currentMonthIndex.set(state)
