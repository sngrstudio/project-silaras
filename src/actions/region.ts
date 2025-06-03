import { defineAction } from 'astro:actions'
import {
  upsertRegion,
  getRegionById,
  getRegionBySlug,
  getAllRegions,
  getAllRegionsWithCounts,
  getRegionsByType,
  deleteRegion
} from '../db/queries/region'
import { z } from 'astro:schema'

/**
 * Astro Actions for Region table
 * Each action corresponds to a query function for region data operations.
 */

const region = {
  /**
   * Upsert (insert or update) a region.
   * @param data Region data (name, slug, type, id?, parentId?)
   * @returns The newly created or updated region object
   */
  upsert: defineAction({
    input: z.object({
      name: z.string(),
      slug: z.string(),
      type: z.enum(['KABUPATEN', 'KECAMATAN', 'DESA']),
      id: z.string().optional().nullable(),
      parentId: z.string().optional().nullable()
    }),
    handler: async (input) => {
      // Remove undefined/null for id/parentId if not present
      const { id, parentId, ...rest } = input
      return await upsertRegion({
        ...rest,
        ...(id ? { id } : {}),
        ...(parentId ? { parentId } : {})
      })
    }
  }),

  /**
   * Get a region by its id.
   * @param id Region id
   * @returns Region object or null if not found
   */
  getById: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }) => getRegionById(id)
  }),

  /**
   * Get a region by its slug.
   * @param slug Region slug
   * @returns Region object or null if not found
   */
  getBySlug: defineAction({
    input: z.object({ slug: z.string() }),
    handler: async ({ slug }) => getRegionBySlug(slug)
  }),

  /**
   * Get a paginated list of regions.
   * @param page Page number (1-based, defaults to 1)
   * @param size Page size (defaults to 10)
   * @returns Array of regions for the page
   */
  getAll: defineAction({
    input: z.object({
      page: z.number().optional(),
      size: z.number().optional(),
      parentSlug: z.string().optional()
    }),
    handler: async ({ page, size, parentSlug }) =>
      getAllRegions(page, size, parentSlug)
  }),

  /**
   * Get a paginated list of regions with count data.
   * @param page Page number (1-based, defaults to 1)
   * @param size Page size (defaults to 8)
   * @param parentSlug Optional parent slug to filter regions by
   * @returns Array of regions with child region and target counts
   */
  getAllWithCounts: defineAction({
    input: z.object({
      page: z.number().optional(),
      size: z.number().optional(),
      parentSlug: z.string().optional()
    }),
    handler: async ({ page, size, parentSlug }) =>
      getAllRegionsWithCounts(page, size, parentSlug)
  }),

  /**
   * Get all regions by type without pagination.
   * @param type Region type ('KABUPATEN', 'KECAMATAN', 'DESA')
   * @returns Array of regions of the specified type
   */
  getByType: defineAction({
    input: z.object({
      type: z.enum(['KABUPATEN', 'KECAMATAN', 'DESA'])
    }),
    handler: async ({ type }) => getRegionsByType(type)
  }),

  /**
   * Delete a region by id.
   * @param id Region id
   * @returns void
   */
  delete: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }) => {
      await deleteRegion(id)
    }
  })
}

export default region
