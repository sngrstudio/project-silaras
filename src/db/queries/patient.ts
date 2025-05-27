import { db } from '../db'
import { patient } from '../schemas/patient'
import { region } from '../schemas/region'
import {
  patientMonthlyAssesment,
  patientDailyAssesment,
  monthlyAssesment,
  dailyAssesment
} from '../schemas/assesment'
import { eq } from 'drizzle-orm'

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
  id?: string
}) => {
  // Always set id: use provided or generate new
  const id = data.id ?? Bun.randomUUIDv7()
  // If no id, generate slug for new patient
  let slug: string
  if (!data.id) {
    slug = generatePatientSlug(data.name)
  } else {
    // update: fetch existing slug
    const existing = await db
      .select({ slug: patient.slug })
      .from(patient)
      .where(eq(patient.id, data.id))
      .limit(1)
      .then((rows) => rows[0])
    if (!existing?.slug) throw new Error('Patient not found for update')
    slug = existing.slug
  }
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
      initialHeight: data.initialHeight
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
          initialHeight: data.initialHeight
        }
      })
    // Only create patientMonthlyAssesment and patientDailyAssesment join rows for new patient
    if (!data.id) {
      // For each available monthly assessment, create join row for this patient
      const monthlyAssesments = await tx.select().from(monthlyAssesment)
      for (const monthly of monthlyAssesments) {
        await tx.insert(patientMonthlyAssesment).values({
          patientId: id,
          monthlyAssesmentId: monthly.id,
          weight: data.initialWeight,
          height: data.initialHeight
        })
        // For each available daily assessment for this monthly, create join row for this patient
        const dailyAssesments = await tx
          .select()
          .from(dailyAssesment)
          .where(eq(dailyAssesment.monthlyAssesmentId, monthly.id))
        for (const daily of dailyAssesments) {
          await tx.insert(patientDailyAssesment).values({
            patientId: id,
            dailyAssesmentId: daily.id,
            containsStapleFood: false,
            containsSideDish: false,
            containsVegetables: false,
            containsFruits: false,
            isFollowingRecipe: false
          })
        }
      }
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
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let rand = ''
  for (let i = 0; i < 6; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${base}-${rand}`
}
