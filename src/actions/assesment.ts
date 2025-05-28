import { defineAction } from 'astro:actions'
import {
  upsertMonthlyAssesment,
  upsertDailyAssesment,
  getAllDailyAssesmentsByPatientAndMonth,
  upsertPatientDailyAssesment,
  getMonthlyAssesment,
  upsertPatientMonthlyAssesment,
  getDailyAssesments,
  MONTHS,
  type Month
} from '../db/queries/assesment'
import { z } from 'astro:schema'

/**
 * Astro Actions for Assessment Definitions and Patient Results
 *
 * Structure:
 * - monthly.get: Get a patient's monthly assessment summary (from view) by patientSlug and monthIndex (1-12)
 * - monthly.set: Upsert (insert or update) a patient's monthly assessment result by patientId and monthlyAssesmentId
 * - daily.set: Upsert (insert or update) a patient's daily assessment result by patientId and dailyAssesmentId
 * - daily.getAll: Get all daily assessment results for a patient, paginated by monthIndex (1-12)
 * - settings.setMonthly: Upsert a monthly assessment definition by month name (enum)
 * - settings.setDaily: Upsert a daily assessment definition by monthlyAssesmentId, date, menu1, and menu2
 */
const assesment = {
  monthly: {
    /**
     * Get a patient's monthly assessment summary (from view).
     *
     * @param {string} patientSlug - The slug of the patient.
     * @param {number} monthIndex - The month index (1 = January, 12 = December).
     * @returns {Promise<object|null>} The patient's monthly assessment summary (from view) or null if not found.
     */
    get: defineAction({
      input: z.object({
        patientSlug: z.string(),
        monthIndex: z.number().int().min(1).max(12)
      }),
      handler: async ({ patientSlug, monthIndex }) => {
        const month = MONTHS[monthIndex - 1]
        if (!month) throw new Error('Invalid month index')
        return await getMonthlyAssesment({ patientSlug, month })
      }
    }),
    /**
     * Upsert (insert or update) a patient's monthly assessment result.
     *
     * @param {string} patientId - The ID of the patient.
     * @param {string} monthlyAssesmentId - The ID of the monthly assessment definition.
     * @param {number} weight - The patient's weight for the month.
     * @param {number} height - The patient's height for the month.
     * @returns {Promise<object|null>} The upserted or updated row from the view, or null if not found.
     */
    set: defineAction({
      accept: 'form',
      input: z.object({
        patientId: z.string(),
        monthlyAssesmentId: z.string(),
        weight: z.number(),
        height: z.number()
      }),
      handler: async (input) => {
        return await upsertPatientMonthlyAssesment(input)
      }
    })
  },
  daily: {
    /**
     * Upsert (insert or update) a patient's daily assessment result.
     *
     * @param {string} patientId - The ID of the patient.
     * @param {string} dailyAssesmentId - The ID of the daily assessment definition.
     * @param {boolean} containsStapleFood - Whether the assessment contains staple food.
     * @param {boolean} containsSideDish - Whether the assessment contains a side dish.
     * @param {boolean} containsVegetables - Whether the assessment contains vegetables.
     * @param {boolean} containsFruits - Whether the assessment contains fruits.
     * @param {boolean} isFollowingRecipe - Whether the assessment follows the recipe.
     * @returns {Promise<object|undefined>} The upserted or updated patientDailyAssesment row, or undefined if not found.
     *
     * @example
     * await actions.assesment.daily.set({
     *   patientId: 'abc123',
     *   dailyAssesmentId: 'def456',
     *   containsStapleFood: true,
     *   containsSideDish: false,
     *   containsVegetables: true,
     *   containsFruits: false,
     *   isFollowingRecipe: true
     * })
     */
    set: defineAction({
      accept: 'form',
      input: z.object({
        patientId: z.string(),
        dailyAssesmentId: z.string(),
        containsStapleFood: z.boolean(),
        containsSideDish: z.boolean(),
        containsVegetables: z.boolean(),
        containsFruits: z.boolean(),
        isFollowingRecipe: z.boolean()
      }),
      handler: async (input) => {
        // Use the upsertPatientDailyAssesment query for upsert logic
        return await upsertPatientDailyAssesment(input)
      }
    }),
    /**
     * Get all daily assessment results for a patient, paginated by month.
     *
     * @param {string} patientSlug - The slug of the patient.
     * @param {number} monthIndex - The month index (1 = January, 12 = December).
     * @returns {Promise<Array<object>>} Array of daily assessment results for the given month.
     *
     * @example
     *   await actions.assesment.daily.getAll({ patientSlug: 'slug', monthIndex: 6 }) // June
     */
    getAll: defineAction({
      input: z.object({
        patientSlug: z.string(),
        monthIndex: z.number().int().min(1).max(12) // 1 = January, 12 = December
      }),
      handler: async ({ patientSlug, monthIndex }) => {
        const month = MONTHS[monthIndex - 1]
        if (!month) throw new Error('Invalid month index')
        return await getAllDailyAssesmentsByPatientAndMonth({
          patientSlug,
          month
        })
      }
    })
  },
  settings: {
    /**
     * Upsert (insert or update) a monthly assessment definition.
     *
     * @param {string} month - Month name (enum: 'JANUARY', ...).
     * @returns {Promise<object>} The upserted or found monthly assessment row.
     */
    setMonthly: defineAction({
      input: z.object({ month: z.enum([...MONTHS]) }),
      handler: async ({ month }) => upsertMonthlyAssesment(month as Month)
    }),
    /**
     * Upsert (insert or update) a daily assessment definition.
     *
     * @param {string} monthlyAssesmentId - The ID of the monthly assessment.
     * @param {string|Date} date - The date of the daily assessment.
     * @param {string} menu1 - The first menu for the day.
     * @param {string} menu2 - The second menu for the day.
     * @returns {Promise<object>} The upserted or found daily assessment row.
     */
    setDaily: defineAction({
      accept: 'form',
      input: z.object({
        monthlyAssesmentId: z.string(),
        date: z.coerce.date(),
        menu1: z.string(),
        menu2: z.string()
      }),
      handler: async (input) => {
        return await upsertDailyAssesment(input)
      }
    }),
    /**
     * Get daily assessment definitions for a given month.
     *
     * @param {number} monthIndex - The month index (1 = January, 12 = December).
     * @returns {Promise<Array<object>>} Array of daily assessment definitions for the given month.
     *
     * @example
     *   await actions.assesment.settings.getAllDaily({ monthIndex: 6 }) // June
     */
    getAllDaily: defineAction({
      input: z.object({
        monthIndex: z.number().int().min(1).max(12)
      }),
      handler: async ({ monthIndex }) => {
        const month = MONTHS[monthIndex - 1]
        if (!month) throw new Error('Invalid month index')
        // getDailyAssesments returns daily assessment definitions for the month
        return await getDailyAssesments(month)
      }
    })
  }
}

export default assesment
