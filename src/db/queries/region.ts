import { db } from '../db'
import { region } from '../schemas/region'
import { eq, isNull } from 'drizzle-orm'

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
 * @param parentId Optional parent id to filter regions by (null for top-level regions)
 * @returns Array of regions for the page
 */
export const getAllRegions = async (
  page?: number,
  size: number = 10,
  parentId?: string | null
) => {
  const pageNumber = page && page > 0 ? page : 1
  const offset = (pageNumber - 1) * size
  let whereClause
  if (parentId !== undefined) {
    if (parentId === null) {
      whereClause = isNull(region.parentId)
    } else {
      whereClause = eq(region.parentId, parentId)
    }
  }
  const query = whereClause
    ? db.select().from(region).where(whereClause)
    : db.select().from(region)
  return query.limit(size).offset(offset)
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
