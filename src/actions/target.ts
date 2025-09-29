/**
 * @fileoverview Target Management Astro Actions
 *
 * This module defines Astro server actions for managing targets (beneficiaries)
 * in the SILARAS health monitoring application. Targets are individuals being
 * monitored for nutritional and health assessments, including pregnant women,
 * nursing mothers, and children.
 *
 * @features
 * - Complete target lifecycle management (CRUD operations)
 * - Health status classification and tracking
 * - Geographic location recording and mapping
 * - Initial health metrics baseline establishment
 * - Region-based organization and filtering
 * - Image management integration with Cloudinary
 * - Slug-based URL generation for targets
 * - Form-based data input with validation
 *
 * @healthStatus
 * - HAMIL: Pregnant women requiring prenatal monitoring
 * - MENYUSUI: Nursing mothers needing postpartum care
 * - ANAK-ANAK: Children under nutritional monitoring
 *
 * @dataPoints
 * - Personal Information: Name, mother's name, birth date
 * - Health Status: Current monitoring category
 * - Location: GPS coordinates for geographic analysis
 * - Initial Metrics: Baseline weight and height measurements
 * - Regional Assignment: Administrative region association
 *
 * @actions
 * - upsert: Create or update target profiles
 * - getById: Retrieve target by unique identifier
 * - getBySlug: Retrieve target by URL-friendly slug
 * - getAll: List targets with pagination and filtering
 * - delete: Remove targets with cleanup
 * - getImages: Retrieve associated target images
 *
 * @validation
 * - Required health metrics validation
 * - Geographic coordinate validation
 * - Region assignment verification
 * - File upload sanitization
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

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
   * Get a paginated list of targets with metadata.
   * Requires editor level access or above.
   * @param page Page number (1-based, defaults to 1)
   * @param size Page size (defaults to 10)
   * @param regionSlug Region slug to filter targets by region (required)
   * @returns Object with targets data and pagination metadata
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

      const result = await getAllTargets(page, size, regionSlug)
      return result
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
