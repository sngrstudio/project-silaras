import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  deletePresignedImageURL,
  getPresignedImageURL,
  upsertPresignedImageURL
} from '~/db/queries/image'

// Create S3 client with proper AWS configuration
export const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1', // Default to us-east-1 if not provided
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
  }
})

// S3 bucket name
export const bucketName = process.env.S3_BUCKET || ''

export const uploadS3 = async (file: File, fileName: string) => {
  try {
    // Validate bucket configuration
    if (!bucketName) {
      throw new Error('S3_BUCKET environment variable is not configured')
    }

    // Convert File object to ArrayBuffer
    const buffer = await file.arrayBuffer()

    // Create the upload command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: new Uint8Array(buffer),
      ContentType: file.type
    })

    // Execute the upload command
    await s3Client.send(command)
  } catch (error: any) {
    // AWS SDK throws errors with name, message, and $metadata properties
    throw new Error(`Failed to upload file: ${error.code || error.message}`)
  }
}

export const getPresignURLS3 = async (fileName: string) => {
  try {
    const EXPIRES_IN = 60 * 60 * 24 * 7 // 7 days in seconds

    // Create the get object command
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName
    })

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, command, {
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
    // Delete presigned URL from database if it exists
    const existingPresignedURL = await getPresignedImageURL(fileName)
    if (existingPresignedURL) {
      await deletePresignedImageURL(existingPresignedURL.fileName)
    }

    // Create and execute the delete command
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName
    })

    await s3Client.send(command)
  } catch (error: any) {
    throw new Error(`Failed to delete file: ${error.code || error.message}`)
  }
}
