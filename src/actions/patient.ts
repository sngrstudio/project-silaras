import { defineAction } from 'astro:actions'
import {
  upsertPatient,
  getPatientById,
  getAllPatients,
  deletePatient,
  getPatientBySlug
} from '../db/queries/patient'
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
      id: z.string().optional().nullable()
    }),
    handler: async (input) => {
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
   * @param id Patient id
   * @returns Patient object or null if not found
   */
  getById: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }) => getPatientById(id)
  }),

  /**
   * Get a patient by its slug.
   * @param slug Patient slug
   * @returns Patient object or null if not found
   */
  getBySlug: defineAction({
    input: z.object({ slug: z.string() }),
    handler: async ({ slug }) => getPatientBySlug(slug)
  }),

  /**
   * Get a paginated list of patients.
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
    handler: async ({ page, size, regionSlug }) =>
      getAllPatients(page, size, regionSlug)
  }),

  /**
   * Delete a patient by id.
   * @param id Patient id
   * @returns void
   */
  delete: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }) => {
      await deletePatient(id)
    }
  })
}

export default patient
