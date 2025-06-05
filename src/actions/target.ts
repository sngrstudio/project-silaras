import { defineAction, ActionError } from 'astro:actions'
import {
  upsertTarget,
  getTargetById,
  getAllTargets,
  deleteTarget,
  getTargetBySlug,
  getTargetImages
} from '../db/queries/target'
import { getRegionById } from '../db/queries/region'
import { deleteMultipleFromCloudinary } from '../utils/cloudinary'
import { z } from 'astro:schema'

/**
 * Astro Actions for Target table
 * Each action corresponds to a query function for target data operations.
 *
 * - upsert: Insert or update a target (requires name, motherName, birthDate, status, latitude, longitude, regionId, initialWeight, initialHeight; id and slug optional)
 * - getById: Get a target by its id
 * - getBySlug: Get a target by its slug
 * - getAll: Get a paginated list of targets (optionally filtered by regionSlug)
 * - delete: Delete a target by id
 */

const target = {
  /**
   * Upsert (insert or update) a target.
   * @param data Target data (name, motherName, birthDate, status, latitude, longitude, regionId, initialWeight, initialHeight, id?, slug?)
   * @returns The newly created or updated target object
   */
  upsert: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string(),
      motherName: z.string(),
      birthDate: z.union([z.string(), z.date()]),
      status: z.enum(['HAMIL', 'MENYUSUI', 'ANAK-ANAK']),
      latitude: z.number(),
      longitude: z.number(),
      regionId: z.string(),
      initialWeight: z.number(),
      initialHeight: z.number(),
      address: z.string().optional().nullable(),
      phoneNumber: z.string().optional().nullable(),
      id: z.string().optional().nullable()
    }),
    handler: async (input, ctx) => {
      const currentUser = ctx.locals.user

      // Only editors (level 2) and above can create/edit targets
      if (!currentUser || currentUser.accessLevel < 2) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki izin untuk mengelola data sasaran.'
        })
      }

      // For non-admins, check region access
      if (currentUser.accessLevel < 4) {
        // Users without region assignment cannot manage targets
        if (!currentUser.regionId) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak memiliki wilayah yang ditugaskan untuk mengelola sasaran.'
          })
        }

        // Get user's assigned region
        const userRegion = await getRegionById(currentUser.regionId)
        if (!userRegion) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Wilayah penugasan Anda tidak valid.'
          })
        }

        // Get the target region for the target
        const targetRegion = await getRegionById(input.regionId)
        if (!targetRegion) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Wilayah sasaran tidak valid.'
          })
        }

        // Access control based on user level and region hierarchy
        if (currentUser.accessLevel === 3) {
          // Coordinators can manage targets in desa under their kecamatan
          if (
            targetRegion.type !== 'DESA' ||
            targetRegion.parentId !== userRegion.id
          ) {
            throw new ActionError({
              code: 'FORBIDDEN',
              message:
                'Anda hanya dapat mengelola sasaran di desa yang berada di bawah kecamatan Anda.'
            })
          }
        } else if (currentUser.accessLevel === 2) {
          // Editors can only manage targets in their assigned desa
          if (
            targetRegion.id !== userRegion.id ||
            targetRegion.type !== 'DESA'
          ) {
            throw new ActionError({
              code: 'FORBIDDEN',
              message:
                'Anda hanya dapat mengelola sasaran di desa yang ditugaskan kepada Anda.'
            })
          }
        }
      }

      const { id, ...rest } = input as any
      return await upsertTarget({
        ...rest,
        ...(id ? { id } : {}),
        birthDate:
          typeof input.birthDate === 'string'
            ? new Date(input.birthDate)
            : input.birthDate
      })
    }
  }),

  /**
   * Get a target by its id.
   * Requires editor level access or above.
   * @param id Target id
   * @returns Target object or null if not found
   */
  getById: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }, ctx) => {
      const currentUser = ctx.locals.user

      // Only editors (level 2) and above can view target details
      if (!currentUser || currentUser.accessLevel < 2) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki izin untuk melihat detail sasaran.'
        })
      }

      return getTargetById(id)
    }
  }),

  /**
   * Get a target by its slug.
   * Requires editor level access or above.
   * @param slug Target slug
   * @returns Target object or null if not found
   */
  getBySlug: defineAction({
    input: z.object({ slug: z.string() }),
    handler: async ({ slug }, ctx) => {
      const currentUser = ctx.locals.user

      // Only editors (level 2) and above can view target details
      if (!currentUser || currentUser.accessLevel < 2) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki izin untuk melihat detail sasaran.'
        })
      }

      return getTargetBySlug(slug)
    }
  }),

  /**
   * Get a paginated list of targets.
   * Requires editor level access or above.
   * @param page Page number (1-based, defaults to 1)
   * @param size Page size (defaults to 10)
   * @param regionSlug Region slug to filter targets by region (required)
   * @returns Array of targets for the page
   */
  getAll: defineAction({
    input: z.object({
      page: z.number().optional(),
      size: z.number().optional(),
      regionSlug: z.string() // now required
    }),
    handler: async ({ page, size, regionSlug }, ctx) => {
      const currentUser = ctx.locals.user

      // Only editors (level 2) and above can view target lists
      if (!currentUser || currentUser.accessLevel < 2) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki izin untuk melihat daftar sasaran.'
        })
      }

      return getAllTargets(page, size, regionSlug)
    }
  }),

  /**
   * Delete a target by id.
   * Requires editor level access (level 2+).
   * @param id Target id
   * @returns void
   */
  delete: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }, ctx) => {
      const currentUser = ctx.locals.user

      // Only editors (level 2) and above can delete targets
      if (!currentUser || currentUser.accessLevel < 2) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki izin untuk menghapus data sasaran.'
        })
      }

      // First, get all images that need to be deleted from Cloudinary
      const imagesToDelete = await getTargetImages(id)

      // Delete all images from Cloudinary in a single batch call for efficiency
      if (imagesToDelete.length > 0) {
        await deleteMultipleFromCloudinary(imagesToDelete)
      }

      // Delete the target record (CASCADE DELETE will handle related records)
      await deleteTarget(id)
    }
  })
}

export default target
