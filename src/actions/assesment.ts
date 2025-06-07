/**
 * @fileoverview Assessment Management Astro Actions
 *
 * This module defines comprehensive Astro server actions for managing health and
 * nutritional assessments in the SILARAS application. It handles both assessment
 * definitions (templates) and individual target assessment results with a
 * sophisticated two-tier system of monthly and daily assessments.
 *
 * @features
 * - Monthly assessment definition management (JUNE-OCTOBER periods)
 * - Daily assessment menu configuration and templates
 * - Target daily assessment tracking with 5-component nutrition scoring
 * - Target monthly anthropometric measurements (weight, height, BMI)
 * - Progress tracking and completion percentage calculations
 * - Metrics comparison between assessment periods
 * - Image upload and management for assessment documentation
 * - File hash validation for data integrity
 * - Cloudinary integration for media storage
 *
 * @assessmentStructure
 * - Monthly Assessments: Define assessment periods (e.g., JUNE, JULY)
 * - Daily Assessments: Define daily menu templates within monthly periods
 * - Target Daily Assessments: Individual daily nutrition assessments
 * - Target Monthly Assessments: Individual monthly anthropometric data
 *
 * @scoringSystem
 * - Contains Staple Food (0-1 points)
 * - Contains Side Dish (0-1 points)
 * - Contains Vegetables (0-1 points)
 * - Contains Fruits (0-1 points)
 * - Is Following Recipe (0-1 points)
 * - Total Score: Sum of all components (0-5 points)
 *
 * @actions
 * - monthly.get: Retrieve target monthly assessment summaries
 * - monthly.set: Record target monthly measurements
 * - daily.set: Record target daily nutrition assessments
 * - daily.getAll: List target daily assessments with pagination
 * - settings.setMonthly: Configure monthly assessment definitions
 * - settings.setDaily: Configure daily assessment menu templates
 *
 * @validation
 * - Access level verification (editor+ required)
 * - Target existence validation
 * - Assessment period validation
 * - Nutrition scoring validation
 * - File upload sanitization
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import { defineAction, ActionError } from 'astro:actions'
import {
  upsertMonthlyAssesment,
  upsertDailyAssesment,
  getAllDailyAssesmentsByTargetAndMonth,
  upsertTargetDailyAssesment,
  getMonthlyAssesment,
  upsertTargetMonthlyAssesment,
  getDailyAssesments,
  getTargetCompletionProgress,
  getTargetMetricsComparison,
  MONTHS,
  type Month
} from '../db/queries/assesment'
import { getTargetById } from '../db/queries/target'
import { getFileHash } from '../utils/file-hash'
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary'
import { db } from '../db/db'
import { targetDailyAssesment } from '../db/schemas/assesment'
import { eq, and } from 'drizzle-orm'
import { z } from 'astro:schema'
const assesment = {
  monthly: {
    /**
     * Get a target's monthly assessment summary (from view).
     * Requires editor level access or above.
     *
     * @param targetSlug - The slug of the target.
     * @param monthIndex - The month index (1 = January, 12 = December).
     * @returns The target's monthly assessment summary (from view) or null if not found.
     */
    get: defineAction({
      input: z.object({
        targetSlug: z.string(),
        monthIndex: z.number().int().min(1).max(12)
      }),
      handler: async ({ targetSlug, monthIndex }, ctx) => {
        const currentUser = ctx.locals.user

        // Only editors (level 2) and above can view target assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Anda tidak memiliki izin untuk melihat penilaian sasaran.'
          })
        }

        const month = MONTHS[monthIndex - 1]
        if (!month) throw new Error('Invalid month index')
        return await getMonthlyAssesment({ targetSlug, month })
      }
    }),
    /**
     * Upsert (insert or update) a target's monthly assessment result.
     * Requires editor level access or above.
     *
     * @param targetId - The ID of the target.
     * @param monthlyAssesmentId - The ID of the monthly assessment definition.
     * @param weight - The target's weight for the month.
     * @param height - The target's height for the month.
     * @returns The upserted or updated row from the view, or null if not found.
     */
    set: defineAction({
      accept: 'form',
      input: z.object({
        targetId: z.string(),
        monthlyAssesmentId: z.string(),
        weight: z.number(),
        height: z.number()
      }),
      handler: async (input, ctx) => {
        const currentUser = ctx.locals.user

        // Only editors (level 2) and above can update target monthly assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak memiliki izin untuk memperbarui penilaian bulanan sasaran.'
          })
        }

        return await upsertTargetMonthlyAssesment(input)
      }
    }),
    /**
     * Get completion progress for a target in a specific month.
     * Requires editor level access or above.
     *
     * @param targetSlug - The slug of the target.
     * @param monthIndex - The month index (1 = January, 12 = December).
     * @returns Object containing progress percentage and counts.
     */
    getProgress: defineAction({
      input: z.object({
        targetSlug: z.string(),
        monthIndex: z.number().int().min(1).max(12)
      }),
      handler: async ({ targetSlug, monthIndex }, ctx) => {
        const currentUser = ctx.locals.user

        // Only editors (level 2) and above can view target assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Anda tidak memiliki izin untuk melihat penilaian sasaran.'
          })
        }

        const month = MONTHS[monthIndex - 1]
        if (!month) throw new Error('Invalid month index')
        return await getTargetCompletionProgress({ targetSlug, month })
      }
    }),
    /**
     * Get metrics comparison for a target (current vs previous month).
     * Requires editor level access or above.
     *
     * @param targetSlug - The slug of the target.
     * @param monthIndex - The month index (1 = January, 12 = December).
     * @returns Object containing current, previous, and delta data.
     */
    getMetricsComparison: defineAction({
      input: z.object({
        targetSlug: z.string(),
        monthIndex: z.number().int().min(1).max(12)
      }),
      handler: async ({ targetSlug, monthIndex }, ctx) => {
        const currentUser = ctx.locals.user

        // Only editors (level 2) and above can view target assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Anda tidak memiliki izin untuk melihat penilaian sasaran.'
          })
        }

        const month = MONTHS[monthIndex - 1]
        if (!month) throw new Error('Invalid month index')
        return await getTargetMetricsComparison({
          targetSlug,
          currentMonth: month
        })
      }
    })
  },
  daily: {
    /**
     * Upsert (insert or update) a target's daily assessment result.
     *
     * @param targetId - The ID of the target.
     * @param dailyAssesmentId - The ID of the daily assessment definition.
     * @param containsStapleFood - Whether the assessment contains staple food.
     * @param containsSideDish - Whether the assessment contains a side dish.
     * @param containsVegetables - Whether the assessment contains vegetables.
     * @param containsFruits - Whether the assessment contains fruits.
     * @param isFollowingRecipe - Whether the assessment follows the recipe.
     * @returns The upserted or updated targetDailyAssesment row, or undefined if not found.
     *
     * @example
     * await actions.assesment.daily.set({
     *   targetId: 'abc123',
     *   dailyAssesmentId: 'def456',
     *   containsStapleFood: true,
     *   containsSideDish: false,
     *   containsVegetables: true,
     *   containsFruits: false,
     *   isFollowingRecipe: true
     * })
    /**
     * Upsert (insert or update) a target's daily assessment result.
     * Requires editor level access or above.
     *
     * @param targetId - The ID of the target.
     * @param dailyAssesmentId - The ID of the daily assessment definition.
     * @param containsStapleFood - Whether the assessment contains staple food.
     * @param containsSideDish - Whether the assessment contains a side dish.
     * @param containsVegetables - Whether the assessment contains vegetables.
     * @param containsFruits - Whether the assessment contains fruits.
     * @param isFollowingRecipe - Whether the assessment follows the recipe.
     * @returns The upserted or updated targetDailyAssesment row, or undefined if not found.
     *
     * @example
     * await actions.assesment.daily.set({
     *   targetId: 'abc123',
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
        targetId: z.string(),
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

        // Only editors (level 2) and above can update target daily assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak memiliki izin untuk memperbarui penilaian harian sasaran.'
          })
        }

        // Get existing assessment to check for current image (for Cloudinary cleanup)
        const existingAssessment = await db
          .select({ image: targetDailyAssesment.image })
          .from(targetDailyAssesment)
          .where(
            and(
              eq(targetDailyAssesment.targetId, input.targetId),
              eq(targetDailyAssesment.dailyAssesmentId, input.dailyAssesmentId)
            )
          )
          .limit(1)
          .then((rows) => rows[0])

        let imageFileName: string | null | undefined = undefined

        // Handle the three cases for image handling:
        // 1. If removeImage is explicitly true -> remove image (set to null)
        // 2. If imageFile is provided -> replace image (set to new filename)
        // 3. If neither -> don't touch image (undefined - no change)

        if (input.removeImage === true) {
          // Case 3: Explicitly removing image
          // Delete old image from Cloudinary if it exists
          if (existingAssessment?.image) {
            try {
              await deleteFromCloudinary(existingAssessment.image)
            } catch (error) {
              console.error('Failed to delete image from Cloudinary:', error)
              // Continue with removal even if Cloudinary deletion fails
            }
          }
          imageFileName = null
        } else if (input.imageFile && input.imageFile.size > 0) {
          // Case 2: New file provided - replace existing image
          // Validate targetId
          if (!input.targetId || input.targetId.trim() === '') {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'ID sasaran tidak valid.'
            })
          }

          // Fetch target data to get the slug
          const target = await getTargetById(input.targetId)
          if (!target) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'Sasaran tidak ditemukan.'
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

          // Generate filename using target slug, sanitized daily assessment ID, and file hash (first 8 characters)
          const sanitizedDailyAssesmentId = input.dailyAssesmentId.replace(
            /[^a-zA-Z0-9\-_]/g,
            ''
          )
          const shortHash = fileHash.substring(0, 8)
          const fileName = `assesment-${target.slug}-${sanitizedDailyAssesmentId}-${shortHash}.${extension}`

          try {
            // Delete old image from Cloudinary before uploading new one
            if (existingAssessment?.image) {
              try {
                await deleteFromCloudinary(existingAssessment.image)
              } catch (error) {
                console.error(
                  'Failed to delete old image from Cloudinary:',
                  error
                )
                // Continue with upload even if old image deletion fails
              }
            }

            imageFileName = await uploadToCloudinary(input.imageFile, fileName)
          } catch (error) {
            throw new ActionError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Gagal mengunggah gambar: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
          }
        }
        // Case 1: No file and no explicit removal -> imageFileName remains undefined (no change)

        // Use the upsertTargetDailyAssesment query for upsert logic
        // Prepare parameters, only include image if it's not undefined
        const upsertParams: any = {
          targetId: input.targetId,
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

        const result = await upsertTargetDailyAssesment(upsertParams)
        return result
      }
    }),
    /**
     * Get all daily assessment results for a target, paginated by month.
     * Requires editor level access or above.
     *
     * @param targetSlug - The slug of the target.
     * @param monthIndex - The month index (1 = January, 12 = December).
     * @returns Array of daily assessment results for the given month.
     *
     * @example
     *   await actions.assesment.daily.getAll({ targetSlug: 'slug', monthIndex: 6 }) // June
     */
    getAll: defineAction({
      input: z.object({
        targetSlug: z.string(),
        monthIndex: z.number().int().min(1).max(12) // 1 = January, 12 = December
      }),
      handler: async ({ targetSlug, monthIndex }, ctx) => {
        const currentUser = ctx.locals.user

        // Only editors (level 2) and above can view target daily assessments
        if (!currentUser || currentUser.accessLevel < 2) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak memiliki izin untuk melihat penilaian harian sasaran.'
          })
        }

        const month = MONTHS[monthIndex - 1]
        if (!month) throw new Error('Invalid month index')
        return await getAllDailyAssesmentsByTargetAndMonth({
          targetSlug,
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
     * @param month - Month name (enum: 'JANUARY', ...).
     * @returns The upserted or found monthly assessment row.
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
     * @param monthlyAssesmentId - The ID of the monthly assessment.
     * @param date - The date of the daily assessment.
     * @param menu1 - The first menu for the day.
     * @param menu2 - The second menu for the day.
     * @returns The upserted or found daily assessment row.
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
     * @param monthIndex - The month index (1 = January, 12 = December).
     * @returns Array of daily assessment definitions for the given month.
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
