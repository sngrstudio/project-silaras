import { defineAction } from 'astro:actions'
import {
  upsertMonthlyAssesment,
  upsertDailyAssesment,
  MONTHS,
  type Month,
  getAllDailyAssesmentsByPatientAndMonth,
  upsertPatientDailyAssesment,
  getMonthlyAssesment,
  upsertPatientMonthlyAssesment
} from '../db/queries/assesment'
import { z } from 'astro:schema'

/**
 * Astro Actions for Assessment Definitions and Patient Results
 * - setMonthly: Upsert a monthly assessment definition
 * - setDaily: Upsert a daily assessment definition
 * - monthly.get/set: Get or set a patient's monthly assessment result
 * - daily.get/set: Get or set a patient's daily assessment result
 */
const assesment = {
  /**
   * Upsert (insert or update) a monthly assessment definition.
   * @param month Month name (enum)
   * @returns The upserted or found monthly assessment row
   */
  setMonthly: defineAction({
    input: z.object({ month: z.enum([...MONTHS]) }),
    handler: async ({ month }) => upsertMonthlyAssesment(month as Month)
  }),

  /**
   * Upsert (insert or update) a daily assessment definition.
   * @param monthlyAssesmentId ID of the monthly assessment
   * @param date Date of the daily assessment
   * @param menu1 Menu 1
   * @param menu2 Menu 2
   * @returns The upserted or found daily assessment row
   */
  setDaily: defineAction({
    input: z.object({
      monthlyAssesmentId: z.string(),
      date: z.union([z.string(), z.date()]),
      menu1: z.string(),
      menu2: z.string()
    }),
    handler: async (input) => {
      return upsertDailyAssesment({
        monthlyAssesmentId: input.monthlyAssesmentId,
        date:
          typeof input.date === 'string' ? new Date(input.date) : input.date,
        menu1: input.menu1,
        menu2: input.menu2
      })
    }
  }),

  monthly: {
    /**
     * Get a patient's monthly assessment summary (from view).
     * @param patientSlug Patient slug
     * @param month Month name (enum)
     * @returns The patient's monthly assessment summary or null
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
     * Set (insert or update) a patient's monthly assessment result.
     * @param patientId Patient ID
     * @param monthlyAssesmentId Monthly assessment definition ID
     * @param weight Patient's weight
     * @param height Patient's height
     * @returns true if successful
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
     * This action will insert a new row into the patientDailyAssesment table if one does not exist for the given
     * patientId and dailyAssesmentId, or update the existing row if it does. The upsert is performed using MySQL's
     * ON DUPLICATE KEY UPDATE pattern, as recommended by Drizzle ORM for MySQL compatibility.
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
     * @param patientSlug Patient slug
     * @param monthIndex Month index (1 = January, 12 = December)
     * @returns Array of daily assessment results for the given month
     *
     * Example usage:
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
  }
}

export default assesment
