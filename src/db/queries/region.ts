import { db } from '../db'
import { region } from '../schemas/region'
import { eq } from 'drizzle-orm'

/**
 * Region table query functions.
 *
 * - upsertRegion(data): Insert or update a region (id auto-generated if not provided)
 * - getRegionById(id): Get a region by its id
 * - getAllRegions(page?, size?): Get paginated list of regions (default 10 per page)
 * - updateRegion(id, data): Update region fields by id
 * - deleteRegion(id): Delete a region by id
 */

/**
 * Insert or update a region (upsert). The id is auto-generated if not provided.
 * If a region with the same id exists, it will be updated.
 * @param data Region data (must include name, slug, type, id optional, parentId optional)
 * @returns The newly created or updated region object
 */
export const upsertRegion = async (data: {
  name: string
  slug: string
  type: (typeof region.$inferInsert)['type']
  id?: string
  parentId?: string | null
}) => {
  const [res] = await db
    .insert(region)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        parentId: data.parentId
      }
    })
    .$returningId()
  const id = data.id ?? res?.id
  if (!id) {
    throw new Error('A problem occurred when upserting region.')
  }
  return await getRegionById(id)
}

/**
 * Get a region by its id.
 * @param id Region id
 * @returns Region object or null if not found
 */
export const getRegionById = async (id: string) => {
  return db
    .select()
    .from(region)
    .where(eq(region.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? null)
}

/**
 * Get a paginated list of regions.
 * @param page Page number (1-based, defaults to 1)
 * @param size Page size (defaults to 10)
 * @param parentSlug Optional parent slug to filter regions by (null for top-level regions)
 * @returns Array of regions for the page
 */
export const getAllRegions = async (
  page: number = 1,
  size: number = 8,
  parentSlug?: string
) => {
  const offset = (page - 1) * size

  // If parentSlug is provided, look up the parent region's ID
  let parentId: string | undefined = undefined
  if (parentSlug) {
    parentId = await db
      .select({ id: region.id })
      .from(region)
      .where(eq(region.slug, parentSlug))
      .limit(1)
      .then((rows) => rows[0]?.id)
  }

  const totalRegions = await db.$count(
    region,
    eq(region.parentId, parentId || '')
  )

  const data = await db
    .select()
    .from(region)
    .where(eq(region.parentId, parentId || ''))
    .limit(size)
    .offset(offset)
    .orderBy(region.name)

  return {
    data,
    pageProps: {
      page,
      size,
      total: Math.ceil(totalRegions / size)
    }
  }
}

/**
 * Get all regions by type without pagination.
 * @param type Region type ('KABUPATEN', 'KECAMATAN', 'DESA')
 * @returns Array of regions of the specified type
 */
export const getRegionsByType = async (
  type: (typeof region.$inferInsert)['type']
) => {
  return db
    .select()
    .from(region)
    .where(eq(region.type, type))
    .orderBy(region.name)
}

/**
 * Delete a region by id.
 * @param id Region id
 * @returns void
 */
export const deleteRegion = async (id: string): Promise<void> => {
  await db.delete(region).where(eq(region.id, id))
}

/**
 * Get a region by its slug.
 * @param slug Region slug
 * @returns Region object or null if not found
 */
export const getRegionBySlug = async (slug: string) => {
  return db
    .select()
    .from(region)
    .where(eq(region.slug, slug))
    .limit(1)
    .then((rows) => rows[0] ?? null)
}
