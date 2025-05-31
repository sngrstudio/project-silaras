import { defineAction } from 'astro:actions'
import { getPresignURLS3 } from '../lib/s3'
import { getPresignedImageURL } from '../db/queries/image'
import { getImage } from 'astro:assets'
import { z } from 'astro:schema'

/**
 * Astro Actions for Image handling
 * Each action corresponds to functions for managing S3 presigned URLs.
 */

const image = {
  /**
   * Get a presigned URL for an image file with caching.
   * Returns either an existing presigned URL or generates a new one.
   *
   * Features:
   * - Returns cached URL if one exists and is not near expiration
   * - Automatically renews URLs that will expire within 6 hours
   * - Generates new URLs only when needed
   *
   * @param fileName The name of the file to get a presigned URL for
   * @returns A presigned URL string that can be used to upload/download from S3
   * @throws {Error} if URL generation fails
   *
   * @example
   * const url = await actions.image.getPresignedURL({
   *   fileName: "profile-picture.jpg"
   * })
   * // Use URL for upload: await fetch(url, { method: "PUT", body: file })
   * // Or for download: await fetch(url)
   */
  getPresignedImage: defineAction({
    input: z
      .object({
        fileName: z.string(),
        width: z.number().optional(),
        height: z.number().optional()
      })
      .refine(({ width, height }) => {
        if (width || height) {
          return !!width && !!height
        } else {
          return true
        }
      }),
    handler: async ({ fileName, width, height }) => {
      // Check if we have an existing presigned URL
      const existingURL = await getPresignedImageURL(fileName)

      if (existingURL?.presignedUrl) {
        // Calculate hours until expiry
        const now = new Date()
        const hoursUntilExpiry =
          (existingURL.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)

        // If URL exists but will expire in 24 hours or less, renew it
        if (hoursUntilExpiry <= 24) {
          const renewed = await getPresignURLS3(fileName)
          return await getImage({
            src: renewed?.presignedUrl ?? existingURL.presignedUrl,
            width,
            height
          })
        }

        // If URL exists and not about to expire, return it
        return await getImage({
          src: existingURL.presignedUrl,
          width,
          height
        })
      }

      // If no existing URL, generate a new one
      const newURL = await getPresignURLS3(fileName)
      if (!newURL?.presignedUrl) {
        throw new Error('Failed to generate presigned URL')
      }
      return await getImage({
        src: newURL.presignedUrl,
        width,
        height
      })
    }
  })
}

export default image
