/**
 * @fileoverview Region Database Query Functions
 *
 * This module provides comprehensive database query functions for managing regions
 * in the SILARAS application. Regions represent geographical or organizational
 * hierarchies that can be nested (parent-child relationships) and are used
 * throughout the system for data organization and access control.
 *
 * @features
 * - CRUD operations for regions with hierarchical support
 * - Upsert functionality for insert-or-update operations
 * - Pagination support for large datasets
 * - Parent-child relationship management
 * - Region type classification (e.g., country, state, city)
 * - Slug-based URL-friendly identifiers
 * - Integration with targets and users
 *
 * @database MySQL via Drizzle ORM
 * @schema region table with hierarchical structure
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import { db } from '../db'
import { region } from '../schemas/region'
import { target } from '../schemas/target'
import { user } from '../schemas/user'
import { eq, count, sql } from 'drizzle-orm'

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
/**
 * Get a paginated list of regions.
 * @param page Page number (1-based, defaults to 1)
 * @param size Page size (defaults to 8)
 * @param parentSlug Optional parent slug to filter regions by (null for top-level regions)
 * @returns Array of regions for the page
 */
export const getAllRegions = async (
  page: number = 1,
  size: number = 8,
  parentSlug?: string
) => {
  const offset = (page - 1) * size

  // Use subquery for parentId lookup and window function for total count
  const parentIdSubquery = parentSlug
    ? db
        .select({ id: region.id })
        .from(region)
        .where(eq(region.slug, parentSlug))
        .limit(1)
    : sql`''`

  const results = await db
    .select({
      id: region.id,
      name: region.name,
      slug: region.slug,
      type: region.type,
      parentId: region.parentId,
      totalCount: sql<number>`COUNT(*) OVER()`
    })
    .from(region)
    .where(eq(region.parentId, parentIdSubquery))
    .limit(size)
    .offset(offset)
    .orderBy(region.name)

  const data = results.map(({ totalCount, ...rest }) => rest)
  const total = results[0]?.totalCount ?? 0

  return {
    data,
    pageProps: {
      page,
      size,
      total: Math.ceil(total / size)
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
 * Get count of targets in a given region (including all descendant regions)
 * @param regionId Region id
 * @returns Number of targets in the region and all its descendants
 */
export const getTargetCountByRegion = async (
  regionId: string
): Promise<number> => {
  // For the 3-level hierarchy (KABUPATEN -> KECAMATAN -> DESA), use a single query
  // This covers: current region + direct children + grandchildren
  const result = await db
    .select({ count: count() })
    .from(target)
    .where(
      sql`${target.regionId} IN (
        SELECT ${regionId} as id
        UNION ALL
        SELECT r1.id FROM ${region} r1 WHERE r1.parent_id = ${regionId}
        UNION ALL  
        SELECT r2.id FROM ${region} r1 
        INNER JOIN ${region} r2 ON r2.parent_id = r1.id 
        WHERE r1.parent_id = ${regionId}
      )`
    )

  return result[0]?.count ?? 0
}

/**
 * Get regions with their child region and target counts
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

  // Single query to get regions with counts using subqueries
  const parentIdSubquery = parentSlug
    ? db
        .select({ id: region.id })
        .from(region)
        .where(eq(region.slug, parentSlug))
        .limit(1)
    : sql`''`

  const results = await db
    .select({
      id: region.id,
      name: region.name,
      slug: region.slug,
      type: region.type,
      parentId: region.parentId,
      childRegionCount: sql<number>`(
        SELECT COUNT(*) 
        FROM region r2 
        WHERE r2.parent_id = region.id
      )`,
      targetCount: sql<number>`(
        SELECT COUNT(*) 
        FROM target t 
        WHERE t.region_id IN (
          SELECT region.id as id
          UNION ALL
          SELECT r1.id FROM region r1 WHERE r1.parent_id = region.id
          UNION ALL  
          SELECT r2.id FROM region r1 
          INNER JOIN region r2 ON r2.parent_id = r1.id 
          WHERE r1.parent_id = region.id
        )
      )`,
      userCount: sql<number>`(
        SELECT COUNT(*) 
        FROM user u 
        WHERE u.region_id = region.id
      )`,
      managedByUsers: sql<string>`(
        SELECT GROUP_CONCAT(
          JSON_OBJECT(
            'fullName', u.full_name,
            'phoneNumber', u.phone_number
          )
        ) 
        FROM user u 
        WHERE u.region_id = region.id
      )`,
      totalCount: sql<number>`COUNT(*) OVER()`
    })
    .from(region)
    .where(eq(region.parentId, parentIdSubquery))
    .limit(size)
    .offset(offset)
    .orderBy(region.name)

  const data = results.map(({ totalCount, ...rest }) => rest)
  const total = results[0]?.totalCount ?? 0

  return {
    data,
    pageProps: {
      page,
      size,
      total: Math.ceil(total / size)
    }
  }
}

/**
 * Get child regions by parent ID
 * @param parentId Parent region id
 * @returns Array of child regions
 */
export const getRegionsByParentId = async (parentId: string) => {
  return db
    .select()
    .from(region)
    .where(eq(region.parentId, parentId))
    .orderBy(region.name)
}

/**
 * Get child regions by parent ID that have at least one user attached
 * @param parentId Parent region id
 * @returns Array of child regions with users
 */
export const getRegionsByParentIdWithUsers = async (parentId: string) => {
  return db
    .select({
      id: region.id,
      name: region.name,
      slug: region.slug,
      type: region.type,
      parentId: region.parentId
    })
    .from(region)
    .innerJoin(user, eq(user.regionId, region.id))
    .where(eq(region.parentId, parentId))
    .groupBy(region.id, region.name, region.slug, region.type, region.parentId)
    .orderBy(region.name)
}

/**
 * Get targets by region ID for quick access
 * @param regionId Region id
 * @returns Array of targets in the region
 */
export const getTargetsByRegionId = async (regionId: string) => {
  return db
    .select({
      id: target.id,
      name: target.name,
      slug: target.slug,
      status: target.status
    })
    .from(target)
    .where(eq(target.regionId, regionId))
    .orderBy(target.name)
    .limit(8)
}
