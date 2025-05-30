import { db } from '../db'
import { presignedImageURL } from '../schemas/image'
import { eq } from 'drizzle-orm'

/**
 * Image table query functions for managing presigned URLs.
 */

/**
 * Insert or update a presigned image URL entry.
 * If an entry with the same fileName exists, it will be updated.
 *
 * @param data The presigned URL data (fileName, presignedUrl, expiresAt)
 * @returns The newly created or updated presigned URL object
 */
export const upsertPresignedImageURL = async (data: {
  fileName: string
  presignedUrl: string
  expiresAt: Date
}) => {
  await db
    .insert(presignedImageURL)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        presignedUrl: data.presignedUrl,
        expiresAt: data.expiresAt
      }
    })

  return await getPresignedImageURL(data.fileName)
}

/**
 * Get a presigned image URL entry by its file name.
 *
 * @param fileName The file name to look up
 * @returns The complete presigned URL entry (fileName, presignedUrl, expiresAt) or undefined if not found
 */
export const getPresignedImageURL = async (fileName: string) => {
  return db
    .select()
    .from(presignedImageURL)
    .where(eq(presignedImageURL.fileName, fileName))
    .limit(1)
    .then((rows) => rows[0] ?? undefined)
}

/**
 * Delete a presigned image URL entry by its file name.
 *
 * @param fileName The file name of the entry to delete
 * @returns void
 */
export const deletePresignedImageURL = async (
  fileName: string
): Promise<void> => {
  await db
    .delete(presignedImageURL)
    .where(eq(presignedImageURL.fileName, fileName))
}
