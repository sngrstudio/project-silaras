import { db } from '../db'
import { patient } from '../schemas/patient'
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
 * @param data Patient data (must include name, motherName, birthDate, status, location, regionId, id optional)
 * @returns The newly created or updated patient object
 */
export const upsertPatient = async (data: {
  name: string
  motherName: string
  birthDate: Date
  status: 'HAMIL' | 'MENYUSUI' | 'ANAK-ANAK'
  location: { latitude: number; longitude: number }
  regionId: string
  slug?: string
  id?: string
}) => {
  // Generate slug if not provided
  let slug = data.slug
  if (!slug) {
    slug = generatePatientSlug(data.name)
  }
  const preparedData = {
    ...data,
    slug,
    location: data.location,
    birthDate:
      data.birthDate instanceof Date ? data.birthDate : new Date(data.birthDate)
  }
  const [res] = await db
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
        location: data.location,
        regionId: data.regionId,
        slug
      }
    })
    .$returningId()
  const id = data.id ?? res?.id
  if (!id) {
    throw new Error('A problem occurred when upserting patient.')
  }
  return await getPatientById(id)
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
 * @returns Array of patients for the page
 */
export const getAllPatients = async (page?: number, size: number = 10) => {
  const pageNumber = page && page > 0 ? page : 1
  const offset = (pageNumber - 1) * size
  return db.select().from(patient).limit(size).offset(offset)
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
