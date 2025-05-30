import { S3Client, write } from 'bun'
import {
  deletePresignedImageURL,
  getPresignedImageURL,
  upsertPresignedImageURL
} from '~/db/queries/image'

export const s3 = new S3Client({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET,
  region: process.env.S3_REGION
})

export const uploadS3 = async (file: File, fileName: string) => {
  try {
    const s3file = s3.file(fileName)
    await write(s3file, file)
  } catch (error: any) {
    // Bun's S3 client throws S3Error with code property
    throw new Error(`Failed to upload file: ${error.code || error.message}`)
  }
}

export const getPresignURLS3 = async (fileName: string) => {
  try {
    const EXPIRES_IN = 60 * 60 * 24 * 7
    const s3file = s3.file(fileName)

    const presignedUrl = s3file.presign({
      acl: 'public-read',
      expiresIn: EXPIRES_IN
    })

    if (!presignedUrl) {
      throw new Error('Failed to generate presigned URL')
    }

    return await upsertPresignedImageURL({
      fileName,
      presignedUrl,
      expiresAt: new Date(Date.now() + EXPIRES_IN * 1000)
    })
  } catch (error: any) {
    throw new Error(
      `Failed to get presigned URL: ${error.code || error.message}`
    )
  }
}

export const deleteS3 = async (fileName: string) => {
  try {
    const existingPresignedURL = await getPresignedImageURL(fileName)
    if (existingPresignedURL) {
      await deletePresignedImageURL(existingPresignedURL.fileName)
    }

    const s3file = s3.file(fileName)
    await s3file.delete()
  } catch (error: any) {
    throw new Error(`Failed to delete file: ${error.code || error.message}`)
  }
}
