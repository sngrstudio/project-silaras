import { defineAction, ActionError } from 'astro:actions'
import {
  upsertPatient,
  getPatientById,
  getAllPatients,
  deletePatient,
  getPatientBySlug
} from '../db/queries/patient'
import { getRegionById } from '../db/queries/region'
import { z } from 'astro:schema'

/**
 * Astro Actions for Patient table
 * Each action corresponds to a query function for patient data operations.
 *
 * - upsert: Insert or update a patient (requires name, motherName, birthDate, status, latitude, longitude, regionId, initialWeight, initialHeight; id and slug optional)
 * - getById: Get a patient by its id
 * - getBySlug: Get a patient by its slug
 * - getAll: Get a paginated list of patients (optionally filtered by regionSlug)
 * - delete: Delete a patient by id
 */

const patient = {
  /**
   * Upsert (insert or update) a patient.
   * @param data Patient data (name, motherName, birthDate, status, latitude, longitude, regionId, initialWeight, initialHeight, id?, slug?)
   * @returns The newly created or updated patient object
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

      // Only editors (level 2) and above can create/edit patients
      if (!currentUser || currentUser.accessLevel < 2) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki izin untuk mengelola data pasien.'
        })
      }

      // For non-admins, check region access
      if (currentUser.accessLevel < 4) {
        // Users without region assignment cannot manage patients
        if (!currentUser.regionId) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak memiliki wilayah yang ditugaskan untuk mengelola pasien.'
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

        // Get the target region for the patient
        const targetRegion = await getRegionById(input.regionId)
        if (!targetRegion) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Wilayah pasien tidak valid.'
          })
        }

        // Access control based on user level and region hierarchy
        if (currentUser.accessLevel === 3) {
          // Coordinators can manage patients in desa under their kecamatan
          if (
            targetRegion.type !== 'DESA' ||
            targetRegion.parentId !== userRegion.id
          ) {
            throw new ActionError({
              code: 'FORBIDDEN',
              message:
                'Anda hanya dapat mengelola pasien di desa yang berada di bawah kecamatan Anda.'
            })
          }
        } else if (currentUser.accessLevel === 2) {
          // Editors can only manage patients in their assigned desa
          if (
            targetRegion.id !== userRegion.id ||
            targetRegion.type !== 'DESA'
          ) {
            throw new ActionError({
              code: 'FORBIDDEN',
              message:
                'Anda hanya dapat mengelola pasien di desa yang ditugaskan kepada Anda.'
            })
          }
        }
      }

      const { id, ...rest } = input as any
      return await upsertPatient({
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
   * Get a patient by its id.
   * Requires editor level access or above.
   * @param id Patient id
   * @returns Patient object or null if not found
   */
  getById: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }, ctx) => {
      const currentUser = ctx.locals.user

      // Only editors (level 2) and above can view patient details
      if (!currentUser || currentUser.accessLevel < 2) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki izin untuk melihat detail pasien.'
        })
      }

      return getPatientById(id)
    }
  }),

  /**
   * Get a patient by its slug.
   * Requires editor level access or above.
   * @param slug Patient slug
   * @returns Patient object or null if not found
   */
  getBySlug: defineAction({
    input: z.object({ slug: z.string() }),
    handler: async ({ slug }, ctx) => {
      const currentUser = ctx.locals.user

      // Only editors (level 2) and above can view patient details
      if (!currentUser || currentUser.accessLevel < 2) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki izin untuk melihat detail pasien.'
        })
      }

      return getPatientBySlug(slug)
    }
  }),

  /**
   * Get a paginated list of patients.
   * Requires editor level access or above.
   * @param page Page number (1-based, defaults to 1)
   * @param size Page size (defaults to 10)
   * @param regionSlug Region slug to filter patients by region (required)
   * @returns Array of patients for the page
   */
  getAll: defineAction({
    input: z.object({
      page: z.number().optional(),
      size: z.number().optional(),
      regionSlug: z.string() // now required
    }),
    handler: async ({ page, size, regionSlug }, ctx) => {
      const currentUser = ctx.locals.user

      // Only editors (level 2) and above can view patient lists
      if (!currentUser || currentUser.accessLevel < 2) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki izin untuk melihat daftar pasien.'
        })
      }

      return getAllPatients(page, size, regionSlug)
    }
  }),

  /**
   * Delete a patient by id.
   * Requires admin access.
   * @param id Patient id
   * @returns void
   */
  delete: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }, ctx) => {
      const currentUser = ctx.locals.user

      // Only admins can delete patients
      if (!currentUser || currentUser.accessLevel < 4) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Hanya administrator yang dapat menghapus data pasien.'
        })
      }

      await deletePatient(id)
    }
  })
}

export default patient
