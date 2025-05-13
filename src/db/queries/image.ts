import { eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { presignedImageTable } from '../schema/image'

export const getPresignedImage = async (fileName: string) => {
  const [image] = await getPresignedImageSQL.execute({ fileName })

  return image
}

export const insertPresignedImage = async (
  fileName: string,
  presignedUrl: string,
  expiresAt: Date
) => {
  const insertPresignedImageSQL = db
    .insert(presignedImageTable)
    .values({
      fileName,
      presignedUrl,
      expiresAt
    })
    .onDuplicateKeyUpdate({
      set: {
        fileName,
        presignedUrl,
        expiresAt
      }
    })
    .prepare()

  await insertPresignedImageSQL.execute()

  const presignedImage = await getPresignedImage(fileName)
  if (!presignedImage) {
    throw new Error('Gambar tidak ada, mungkin terjadi masalah.')
  }

  return presignedImage
}

export const deletePresignedImage = async (fileName: string) => {
  const deletePresignedImageSQL = db
    .delete(presignedImageTable)
    .where(eq(presignedImageTable.fileName, fileName))
    .prepare()

  await deletePresignedImageSQL.execute()
}

// Prepared SQLs

const getPresignedImageSQL = db
  .select({
    presignedUrl: presignedImageTable.presignedUrl,
    expiresAt: presignedImageTable.expiresAt
  })
  .from(presignedImageTable)
  .where(eq(presignedImageTable.fileName, sql.placeholder('fileName')))
  .limit(1)
  .prepare()
