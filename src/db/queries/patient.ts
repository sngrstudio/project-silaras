import { db } from '../db'
import { patient } from '../schemas/patient'
import { region } from '../schemas/region'
import { eq, sql } from 'drizzle-orm'

/**
 * Patient table query functions.
 *
 * - upsertPatient(data): Insert or update a patient (id auto-generated if not provided)
 * - getPatientById(id): Get a patient by its id
 * - deletePatient(id): Delete a patient by id
 * - getAllPatients(page?, size?): Get paginated list of patients (default 10 per page)
 */

/**
 * Insert or update a patient (upsert). The id is auto-generated if not provided.
 * If a patient with the same id exists, it will be updated.
 * @param data Patient data (must include name, motherName, birthDate, status, location, regionId, initialWeight, initialHeight, id optional)
 * @returns The newly created or updated patient object
 */
export const upsertPatient = async (data: {
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
  const id = data.id ?? Bun.randomUUIDv7()
  const isUpdate = !!data.id

  // Generate or fetch slug in a single operation
  const slug = isUpdate
    ? await db
        .select({ slug: patient.slug })
        .from(patient)
        .where(eq(patient.id, data.id!))
        .limit(1)
        .then((rows) => {
          if (!rows[0]?.slug) throw new Error('Patient not found for update')
          return rows[0].slug
        })
    : generatePatientSlug(data.name)

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
      .insert(patient)
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

    // Only create assessment join rows for new patients
    if (!isUpdate) {
      // Use a single query with cross join to create all assessment records
      await tx.execute(sql`
        INSERT INTO patient_monthly_assesment (patient_id, monthly_assesment_id, weight, height)
        SELECT ${id}, ma.id, ${data.initialWeight}, ${data.initialHeight}
        FROM monthly_assesment ma
      `)

      await tx.execute(sql`
        INSERT INTO patient_daily_assesment (
          patient_id, daily_assesment_id, 
          contains_staple_food, contains_side_dish, 
          contains_vegetables, contains_fruits, is_following_recipe
        )
        SELECT ${id}, da.id, false, false, false, false, false
        FROM daily_assesment da
        INNER JOIN monthly_assesment ma ON da.monthly_assesment_id = ma.id
      `)
    }

    return await getPatientById(id)
  })
}

/**
 * Get a patient by its id.
 * @param id Patient id
 * @returns Patient object or null if not found
 */
export const getPatientById = async (id: string) => {
  const row = await db
    .select()
    .from(patient)
    .where(eq(patient.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? null)
  return row
}

/**
 * Get a patient by its slug.
 * @param slug Patient slug
 * @returns Patient object or null if not found
 */
export const getPatientBySlug = async (slug: string) => {
  const row = await db
    .select()
    .from(patient)
    .where(eq(patient.slug, slug))
    .limit(1)
    .then((rows) => rows[0] ?? null)
  return row
}

/**
 * Get a paginated list of patients.
 * @param page Page number (1-based, defaults to 1)
 * @param size Page size (defaults to 10)
 * @param regionSlug Region slug to filter patients by region (required)
 * @returns Array of patients for the page
 */
export const getAllPatients = async (
  page: number = 1,
  size: number = 10,
  regionSlug: string // now mandatory and first
) => {
  const offset = (page - 1) * size

  // Use subquery to filter by regionSlug directly
  return db
    .select()
    .from(patient)
    .where(
      eq(
        patient.regionId,
        db
          .select({ id: region.id })
          .from(region)
          .where(eq(region.slug, regionSlug))
          .limit(1)
      )
    )
    .limit(size)
    .offset(offset)
}

/**
 * Delete a patient by id.
 * @param id Patient id
 * @returns void
 */
export const deletePatient = async (id: string): Promise<void> => {
  await db.delete(patient).where(eq(patient.id, id))
}

/**
 * Generate a patient slug from name and a random 6-char string.
 * @param name Patient name
 * @returns Slugified string
 */
const generatePatientSlug = (name: string): string => {
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
