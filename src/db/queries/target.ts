/**
 * @fileoverview Target Database Query Functions
 *
 * This module provides comprehensive database query functions for managing targets
 * (beneficiaries) in the SILARAS health monitoring application. Targets represent
 * individuals being monitored for health and nutrition assessments, including
 * pregnant women, nursing mothers, and children.
 *
 * @features
 * - Complete target CRUD operations with upsert functionality
 * - Health status classification (HAMIL, MENYUSUI, ANAK-ANAK)
 * - Geographic location tracking (latitude/longitude)
 * - Initial health metrics recording (weight, height)
 * - Region-based organization and access control
 * - Mother-child relationship tracking
 * - Assessment history integration
 * - Pagination support for large datasets
 *
 * @healthData
 * - Pregnancy monitoring (HAMIL status)
 * - Nursing mother tracking (MENYUSUI status)
 * - Child development monitoring (ANAK-ANAK status)
 * - Initial baseline measurements
 * - Geographic distribution analysis
 *
 * @database MySQL via Drizzle ORM
 * @schema target table with region and assessment relationships
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import { db } from '../db'
import { target } from '../schemas/target'
import { region } from '../schemas/region'
import { targetDailyAssesment } from '../schemas/assesment'
import { eq, sql } from 'drizzle-orm'
import crypto from 'node:crypto'

/**
 * Insert or update a target (upsert). The id is auto-generated if not provided.
 * If a target with the same id exists, it will be updated.
 * @param data Target data (must include name, motherName, birthDate, status, location, regionId, initialWeight, initialHeight, id optional)
 * @returns The newly created or updated target object
 */
export const upsertTarget = async (data: {
  name: string
  motherName: string
  birthDate: Date
  status: 'HAMIL' | 'MENYUSUI' | 'ANAK-ANAK'
  latitude: number
  longitude: number
  regionId: string
  initialWeight: number
  initialHeight: number
  address?: string | null
  phoneNumber?: string | null
  id?: string
}) => {
  // Always set id: use provided or generate new
  const id = data.id ?? crypto.randomUUID()
  const isUpdate = !!data.id

  // Generate or fetch slug in a single operation
  const slug = isUpdate
    ? await db
        .select({ slug: target.slug })
        .from(target)
        .where(eq(target.id, data.id!))
        .limit(1)
        .then((rows) => {
          if (!rows[0]?.slug) throw new Error('Target not found for update')
          return rows[0].slug
        })
    : generateTargetSlug(data.name)

  // Transactional logic
  return await db.transaction(async (tx) => {
    const preparedData = {
      ...data,
      id,
      slug,
      birthDate:
        data.birthDate instanceof Date
          ? data.birthDate
          : new Date(data.birthDate),
      initialWeight: data.initialWeight,
      initialHeight: data.initialHeight,
      address: data.address ?? null,
      phoneNumber: data.phoneNumber ?? null
    }

    await tx
      .insert(target)
      .values(preparedData)
      .onDuplicateKeyUpdate({
        set: {
          name: data.name,
          motherName: data.motherName,
          birthDate:
            data.birthDate instanceof Date
              ? data.birthDate
              : new Date(data.birthDate),
          status: data.status,
          latitude: data.latitude,
          longitude: data.longitude,
          regionId: data.regionId,
          slug,
          initialWeight: data.initialWeight,
          initialHeight: data.initialHeight,
          address: data.address ?? null,
          phoneNumber: data.phoneNumber ?? null
        }
      })

    // Only create assessment join rows for new targets
    if (!isUpdate) {
      // Use a single query with cross join to create all assessment records
      await tx.execute(sql`
        INSERT INTO target_monthly_assesment (target_id, monthly_assesment_id, weight, height)
        SELECT ${id}, ma.id, ${data.initialWeight}, ${data.initialHeight}
        FROM monthly_assesment ma
      `)

      await tx.execute(sql`
        INSERT INTO target_daily_assesment (
          target_id, daily_assesment_id, 
          contains_staple_food, contains_side_dish, 
          contains_vegetables, contains_fruits, is_following_recipe
        )
        SELECT ${id}, da.id, false, false, false, false, false
        FROM daily_assesment da
        INNER JOIN monthly_assesment ma ON da.monthly_assesment_id = ma.id
      `)
    }

    return await getTargetById(id)
  })
}

/**
 * Get a target by its id.
 * @param id Target id
 * @returns Target object or null if not found
 */
export const getTargetById = async (id: string) => {
  const row = await db
    .select()
    .from(target)
    .where(eq(target.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? null)
  return row
}

/**
 * Get a target by its slug.
 * @param slug Target slug
 * @returns Target object or null if not found
 */
export const getTargetBySlug = async (slug: string) => {
  const row = await db
    .select()
    .from(target)
    .where(eq(target.slug, slug))
    .limit(1)
    .then((rows) => rows[0] ?? null)
  return row
}

/**
 * Get a paginated list of targets with metadata.
 * @param page Page number (1-based, defaults to 1)
 * @param size Page size (defaults to 10)
 * @param regionSlug Region slug to filter targets by region (required)
 * @returns Object with targets data and pagination metadata
 */
export const getAllTargets = async (
  page: number = 1,
  size: number = 10,
  regionSlug: string // now mandatory and first
) => {
  const offset = (page - 1) * size

  // Get region ID first
  const regionResult = await db
    .select({ id: region.id })
    .from(region)
    .where(eq(region.slug, regionSlug))
    .limit(1)

  if (!regionResult[0]) {
    return {
      data: [],
      meta: {
        currentPage: page,
        pageSize: size,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  }

  const regionId = regionResult[0].id

  // Get total count
  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(target)
    .where(eq(target.regionId, regionId))

  const totalCount = totalCountResult[0]?.count || 0
  const totalPages = Math.ceil(totalCount / size)

  // Get paginated data
  const data = await db
    .select()
    .from(target)
    .where(eq(target.regionId, regionId))
    .limit(size)
    .offset(offset)

  return {
    data,
    meta: {
      currentPage: page,
      pageSize: size,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  }
}

/**
 * Delete a target by id.
 * @param id Target id
 * @returns void
 */
export const deleteTarget = async (id: string): Promise<void> => {
  await db.delete(target).where(eq(target.id, id))
}

/**
 * Get all images associated with a target from targetDailyAssesment.
 * @param id Target id
 * @returns Array of image filenames that need to be deleted from Cloudinary
 */
export const getTargetImages = async (id: string): Promise<string[]> => {
  const imagesResult = await db
    .select({ image: targetDailyAssesment.image })
    .from(targetDailyAssesment)
    .where(eq(targetDailyAssesment.targetId, id))

  return imagesResult
    .map((row) => row.image)
    .filter((image): image is string => Boolean(image))
}

/**
 * Generate a target slug from name and a random 6-char string.
 * @param name Target name
 * @returns Slugified string
 */
const generateTargetSlug = (name: string): string => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  // Generate a 16-character, URL-safe, alphanumeric random string
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((n) => 'abcdefghijklmnopqrstuvwxyz0123456789'[n % 36])
    .join('')
  return `${base}-${rand}`
}
