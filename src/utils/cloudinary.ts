import { v2 as cloudinary } from 'cloudinary'

/**
 * Configure Cloudinary with environment variables
 * Using lazy configuration to ensure environment variables are available
 */
const configureCloudinary = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL
  const cloudinaryFolder = process.env.CLOUDINARY_FOLDER

  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL environment variable is not configured')
  }

  if (!cloudinaryFolder) {
    throw new Error('CLOUDINARY_FOLDER environment variable is not configured')
  }

  // Cloudinary URL format: cloudinary://api_key:api_secret@cloud_name
  const url = new URL(cloudinaryUrl)

  cloudinary.config({
    cloud_name: url.hostname,
    api_key: url.username,
    api_secret: url.password,
    secure: true
  })

  return { cloudinary, folder: cloudinaryFolder }
}

/**
 * Upload a file to Cloudinary
 * @param file - The File object to upload
 * @param fileName - The desired filename (will be used to generate public_id)
 * @returns Promise<string> - The Cloudinary public ID of the uploaded image
 */
export const uploadToCloudinary = async (
  file: File,
  fileName: string
): Promise<string> => {
  try {
    // Configure Cloudinary client
    const { cloudinary: cloudinaryClient, folder } = configureCloudinary()

    // Convert File to buffer
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    // Convert buffer to base64 data URL
    const base64 = Buffer.from(uint8Array).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Generate public_id with folder structure
    // Remove file extension from fileName if present for cleaner public_id
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '')
    const publicId = `${folder}/${cleanFileName}`

    // Upload to Cloudinary with proper folder structure
    const result = await cloudinaryClient.uploader.upload(dataUrl, {
      public_id: publicId,
      folder: folder, // Use configurable folder
      resource_type: 'auto', // Auto-detect file type
      overwrite: true, // Allow overwriting existing files
      use_filename: false, // Don't use original filename
      unique_filename: false // Use the specified public_id exactly
    })

    return result.public_id
  } catch (error: any) {
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`)
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The Cloudinary public ID of the image to delete
 * @returns Promise<void>
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    // Configure Cloudinary client
    const { cloudinary: cloudinaryClient } = configureCloudinary()

    // Delete the image using the public_id
    const result = await cloudinaryClient.uploader.destroy(publicId)

    // Check if deletion was successful
    if (result.result !== 'ok') {
      throw new Error(`Cloudinary deletion failed: ${result.result}`)
    }
  } catch (error: any) {
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`)
  }
}
