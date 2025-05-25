import { defineAction } from 'astro:actions'
import {
  upsertMonthlyAssesment,
  upsertDailyAssesment,
  MONTHS,
  type Month
} from '../db/queries/assesment'
import { z } from 'astro:schema'

/**
 * Astro Actions for Assessment Definitions
 * - upsertMonthly: Upsert a monthly assessment definition
 * - upsertDaily: Upsert a daily assessment definition
 */
const assesment = {
  /**
   * Upsert (insert or update) a monthly assessment definition.
   * @param month Month name (enum)
   * @returns The upserted or found monthly assessment row
   */
  upsertMonthly: defineAction({
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
  upsertDaily: defineAction({
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
  })
}

export default assesment
