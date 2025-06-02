import { defineAction, ActionError } from 'astro:actions'
import {
  upsertMonthlyAssesment,
  upsertDailyAssesment,
  getAllDailyAssesmentsByPatientAndMonth,
  upsertPatientDailyAssesment,
  getMonthlyAssesment,
  upsertPatientMonthlyAssesment,
  getDailyAssesments,
  getPatientCompletionProgress,
  getPatientMetricsComparison,
  MONTHS,
  type Month
} from '../db/queries/assesment'
import { getPatientById } from '../db/queries/patient'
import { getFileHash } from '../utils/file-hash'
import { uploadS3 } from '../lib/s3'
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
     * Requires editor level access or above.
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
      handler: async ({ patientSlug, monthIndex }, ctx) => {
        const currentUser = ctx.locals.user

        // Only editors (level 2) and above can view patient assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Anda tidak memiliki izin untuk melihat penilaian pasien.'
          })
        }

        const month = MONTHS[monthIndex - 1]
        if (!month) throw new Error('Invalid month index')
        return await getMonthlyAssesment({ patientSlug, month })
      }
    }),
    /**
     * Upsert (insert or update) a patient's monthly assessment result.
     * Requires editor level access or above.
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
      handler: async (input, ctx) => {
        const currentUser = ctx.locals.user

        // Only editors (level 2) and above can update patient monthly assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak memiliki izin untuk memperbarui penilaian bulanan pasien.'
          })
        }

        return await upsertPatientMonthlyAssesment(input)
      }
    }),
    /**
     * Get completion progress for a patient in a specific month.
     * Requires editor level access or above.
     *
     * @param {string} patientSlug - The slug of the patient.
     * @param {number} monthIndex - The month index (1 = January, 12 = December).
     * @returns {Promise<Object>} Object containing progress percentage and counts.
     */
    getProgress: defineAction({
      input: z.object({
        patientSlug: z.string(),
        monthIndex: z.number().int().min(1).max(12)
      }),
      handler: async ({ patientSlug, monthIndex }, ctx) => {
        const currentUser = ctx.locals.user

        // Only editors (level 2) and above can view patient assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Anda tidak memiliki izin untuk melihat penilaian pasien.'
          })
        }

        const month = MONTHS[monthIndex - 1]
        if (!month) throw new Error('Invalid month index')
        return await getPatientCompletionProgress({ patientSlug, month })
      }
    }),
    /**
     * Get metrics comparison for a patient (current vs previous month).
     * Requires editor level access or above.
     *
     * @param {string} patientSlug - The slug of the patient.
     * @param {number} monthIndex - The month index (1 = January, 12 = December).
     * @returns {Promise<Object>} Object containing current, previous, and delta data.
     */
    getMetricsComparison: defineAction({
      input: z.object({
        patientSlug: z.string(),
        monthIndex: z.number().int().min(1).max(12)
      }),
      handler: async ({ patientSlug, monthIndex }, ctx) => {
        const currentUser = ctx.locals.user

        // Only editors (level 2) and above can view patient assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Anda tidak memiliki izin untuk melihat penilaian pasien.'
          })
        }

        const month = MONTHS[monthIndex - 1]
        if (!month) throw new Error('Invalid month index')
        return await getPatientMetricsComparison({
          patientSlug,
          currentMonth: month
        })
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
    /**
     * Upsert (insert or update) a patient's daily assessment result.
     * Requires editor level access or above.
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
        isFollowingRecipe: z.boolean(),
        imageFile: z.instanceof(File).optional(),
        removeImage: z.boolean().optional()
      }),
      handler: async (input, ctx) => {
        const currentUser = ctx.locals.user

        // Only editors (level 2) and above can update patient daily assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak memiliki izin untuk memperbarui penilaian harian pasien.'
          })
        }

        let imageFileName: string | null | undefined = undefined

        // Handle the three cases for image handling:
        // 1. If removeImage is explicitly true -> remove image (set to null)
        // 2. If imageFile is provided -> replace image (set to new filename)
        // 3. If neither -> don't touch image (undefined - no change)

        if (input.removeImage === true) {
          // Case 3: Explicitly removing image
          imageFileName = null
        } else if (input.imageFile && input.imageFile.size > 0) {
          // Case 2: New file provided - replace existing image
          // Validate patientId
          if (!input.patientId || input.patientId.trim() === '') {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'ID pasien tidak valid.'
            })
          }

          // Fetch patient data to get the slug
          const patient = await getPatientById(input.patientId)
          if (!patient) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'Pasien tidak ditemukan.'
            })
          }

          // Validate file name exists
          if (!input.imageFile.name || input.imageFile.name.trim() === '') {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'Nama file tidak valid.'
            })
          }

          // Validate file type
          if (
            !input.imageFile.type ||
            !input.imageFile.type.startsWith('image/')
          ) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'File harus berupa gambar.'
            })
          }

          // Validate file size (max 5MB)
          if (input.imageFile.size > 5 * 1024 * 1024) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'Ukuran file maksimal 5MB.'
            })
          }

          // Generate file hash for unique filename
          const fileHash = await getFileHash(input.imageFile)
          const fileNameParts = input.imageFile.name.split('.')
          const lastPart =
            fileNameParts.length > 1
              ? fileNameParts[fileNameParts.length - 1]
              : null
          const extension =
            lastPart && lastPart.trim() !== '' ? lastPart.toLowerCase() : 'jpg'

          // Validate extension
          const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
          if (!allowedExtensions.includes(extension)) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message:
                'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.'
            })
          }

          // Generate filename using patient slug, sanitized daily assessment ID, and file hash (first 8 characters)
          const sanitizedDailyAssesmentId = input.dailyAssesmentId.replace(
            /[^a-zA-Z0-9\-_]/g,
            ''
          )
          const shortHash = fileHash.substring(0, 8)
          imageFileName = `assesment-${patient.slug}-${sanitizedDailyAssesmentId}-${shortHash}.${extension}`

          try {
            await uploadS3(input.imageFile, imageFileName)
          } catch (error) {
            console.error('S3 upload error:', error)
            throw new ActionError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Gagal mengunggah gambar: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
          }
        }
        // Case 1: No file and no explicit removal -> imageFileName remains undefined (no change)

        // Use the upsertPatientDailyAssesment query for upsert logic
        // Prepare parameters, only include image if it's not undefined
        const upsertParams: any = {
          patientId: input.patientId,
          dailyAssesmentId: input.dailyAssesmentId,
          containsStapleFood: input.containsStapleFood,
          containsSideDish: input.containsSideDish,
          containsVegetables: input.containsVegetables,
          containsFruits: input.containsFruits,
          isFollowingRecipe: input.isFollowingRecipe,
          lastModifiedBy: currentUser.id
        }

        // Only include image parameter if we want to change it
        if (imageFileName !== undefined) {
          upsertParams.image = imageFileName
        }

        const result = await upsertPatientDailyAssesment(upsertParams)
        return result
      }
    }),
    /**
     * Get all daily assessment results for a patient, paginated by month.
     * Requires editor level access or above.
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
      handler: async ({ patientSlug, monthIndex }, ctx) => {
        const currentUser = ctx.locals.user

        // Only editors (level 2) and above can view patient daily assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak memiliki izin untuk melihat penilaian harian pasien.'
          })
        }

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
     * Requires admin level access.
     *
     * @param {string} month - Month name (enum: 'JANUARY', ...).
     * @returns {Promise<object>} The upserted or found monthly assessment row.
     */
    setMonthly: defineAction({
      input: z.object({ month: z.enum([...MONTHS]) }),
      handler: async ({ month }, ctx) => {
        const currentUser = ctx.locals.user

        // Only admins (level 4) can manage assessment definitions
        if (!currentUser || currentUser.accessLevel < 4) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak memiliki izin untuk mengelola definisi penilaian.'
          })
        }

        return await upsertMonthlyAssesment(month as Month)
      }
    }),
    /**
     * Upsert (insert or update) a daily assessment definition.
     * Requires admin level access.
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
      handler: async (input, ctx) => {
        const currentUser = ctx.locals.user

        // Only admins (level 4) can manage assessment definitions
        if (!currentUser || currentUser.accessLevel < 4) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak memiliki izin untuk mengelola definisi penilaian.'
          })
        }

        return await upsertDailyAssesment(input)
      }
    }),
    /**
     * Get daily assessment definitions for a given month.
     * Requires admin level access.
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
      handler: async ({ monthIndex }, ctx) => {
        const currentUser = ctx.locals.user

        // Only admins (level 4) can view assessment definitions
        if (!currentUser || currentUser.accessLevel < 4) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak memiliki izin untuk melihat definisi penilaian.'
          })
        }

        const month = MONTHS[monthIndex - 1]
        if (!month) throw new Error('Invalid month index')
        // getDailyAssesments returns daily assessment definitions for the month
        return await getDailyAssesments(month)
      }
    })
  }
}

export default assesment
