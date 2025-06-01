import { db } from '../db'
import { region } from '../schemas/region'
import { patient } from '../schemas/patient'
import { eq, count, inArray } from 'drizzle-orm'

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

/**
 * Get count of child regions for a given region
 * @param regionId Parent region id
 * @returns Number of child regions
 */
export const getChildRegionCount = async (regionId: string) => {
  const result = await db
    .select({ count: count() })
    .from(region)
    .where(eq(region.parentId, regionId))
  return result[0]?.count ?? 0
}

/**
 * Get count of patients in a given region (including all descendant regions)
 * @param regionId Region id
 * @returns Number of patients in the region and all its descendants
 */
export const getPatientCountByRegion = async (
  regionId: string
): Promise<number> => {
  // Get all descendant regions recursively
  const getAllDescendantRegions = async (
    parentId: string
  ): Promise<string[]> => {
    const children = await db
      .select({ id: region.id })
      .from(region)
      .where(eq(region.parentId, parentId))

    let allDescendants = [parentId]

    for (const child of children) {
      const childDescendants = await getAllDescendantRegions(child.id)
      allDescendants.push(...childDescendants)
    }

    return allDescendants
  }

  // Get all region IDs (current region + all descendants)
  const allRegionIds = await getAllDescendantRegions(regionId)

  // Count patients in all these regions
  if (allRegionIds.length === 0) {
    return 0
  }

  // Use inArray for better performance with multiple region IDs
  const result = await db
    .select({ count: count() })
    .from(patient)
    .where(inArray(patient.regionId, allRegionIds))

  return result[0]?.count ?? 0
}

/**
 * Get regions with their child region and patient counts
 * @param page Page number (1-based, defaults to 1)
 * @param size Page size (defaults to 8)
 * @param parentSlug Optional parent slug to filter regions by
 * @returns Array of regions with counts
 */
export const getAllRegionsWithCounts = async (
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

  const regions = await db
    .select()
    .from(region)
    .where(eq(region.parentId, parentId || ''))
    .limit(size)
    .offset(offset)
    .orderBy(region.name)

  // Get counts for each region
  const regionsWithCounts = await Promise.all(
    regions.map(async (reg) => {
      const childRegionCount = await getChildRegionCount(reg.id)
      const patientCount = await getPatientCountByRegion(reg.id)

      return {
        ...reg,
        childRegionCount,
        patientCount
      }
    })
  )

  return {
    data: regionsWithCounts,
    pageProps: {
      page,
      size,
      total: Math.ceil(totalRegions / size)
    }
  }
}
