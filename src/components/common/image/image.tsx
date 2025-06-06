import { useEffect, useState, type FC, type ImgHTMLAttributes } from 'react'
import { Cloudinary } from '@cloudinary/url-gen'
import { scale, fit } from '@cloudinary/url-gen/actions/resize'
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality'
import { format } from '@cloudinary/url-gen/actions/delivery'
import { actions } from 'astro:actions'

/**
 * Props interface for the Cloudinary Image component
 *
 * @interface ImageProps
 */
interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /**
   * Cloudinary public ID of the image.
   * This is the unique identifier for the image in your Cloudinary account.
   *
   * @example "folder/my-image" or "profile-photos/user123"
   */
  publicId: string

  /**
   * Width of the image in pixels.
   * Used for Cloudinary transformations and aspect ratio calculations.
   */
  width?: number

  /**
   * Height of the image in pixels.
   * Used for Cloudinary transformations and aspect ratio calculations.
   */
  height?: number

  /**
   * Sizes attribute for responsive images.
   * Tells the browser how wide the image will be at different viewport sizes.
   *
   * @default "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
   */
  sizes?: string

  /**
   * Custom breakpoints for srcSet generation.
   * Array of pixel widths for responsive image variants.
   *
   * @default [320, 640, 768, 1024, 1280, 1536]
   */
  breakpoints?: number[]

  /**
   * Whether to contain the image instead of cropping.
   * - false (default): Image fills the container, may crop to fit
   * - true: Image fits entirely within container, may have letterboxing
   *
   * @default false
   */
  contain?: boolean
}

/**
 * Cloudinary Image Component
 *
 * A React component that provides optimized image delivery using Cloudinary's
 * transformation and CDN capabilities. Supports responsive images with multiple
 * formats (AVIF, WebP, fallback) and automatic quality optimization.
 */
const Image: FC<ImageProps> = ({
  publicId,
  width,
  height,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  breakpoints = [320, 640, 768, 1024, 1280, 1536],
  contain = false,
  ...props
}) => {
  // Get the cloud name from environment variables
  const [cloudName, setCloudName] = useState<string | undefined>(undefined)

  useEffect(() => {
    actions.site.cloudName.orThrow().then((name) => setCloudName(name))
  }, [])

  if (!cloudName) {
    console.error('CLOUDINARY_CLOUD_NAME is not set')
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
      >
        <span className='text-sm text-gray-500'>Image unavailable</span>
      </div>
    )
  }

  // Create Cloudinary instance
  const cloudinary = new Cloudinary({
    cloud: {
      cloudName
    }
  })

  // Generate srcSet for responsive images with specific format
  const generateSrcSet = (imageFormat?: string) => {
    return breakpoints
      .map((breakpointWidth) => {
        const image = cloudinary.image(publicId)

        // Apply format if specified
        if (imageFormat) {
          image.delivery(format(imageFormat))
        }

        // Apply dimensions based on breakpoint
        if (width || height) {
          if (width && height) {
            if (contain) {
              // Use scale to maintain aspect ratio (object-fit: contain behavior)
              const aspectRatio = width / height
              const scaledHeight = Math.round(breakpointWidth * aspectRatio)
              image.resize(fit().width(breakpointWidth).height(scaledHeight))
            } else {
              // Use fit to fill dimensions
              const aspectRatio = width / height
              const scaledHeight = Math.round(breakpointWidth * aspectRatio)
              image.resize(fit().width(breakpointWidth).height(scaledHeight))
            }
          } else if (width) {
            image.resize(scale().width(breakpointWidth))
          } else if (height) {
            // Keep original height, scale width proportionally
            image.resize(scale().height(height))
          }
        } else {
          // No specific dimensions, just scale to breakpoint width
          image.resize(scale().width(breakpointWidth))
        }

        // Apply auto quality
        image.quality(autoQuality())

        return `${image.toURL()} ${breakpointWidth}w`
      })
      .join(', ')
  }

  // Create image with specific format
  const createImageWithFormat = (imageFormat?: string) => {
    const image = cloudinary.image(publicId)

    // Apply format if specified
    if (imageFormat) {
      image.delivery(format(imageFormat))
    }

    // Apply dimensions if provided
    if (width || height) {
      if (width && height) {
        if (contain) {
          // Use scale to maintain aspect ratio (object-fit: contain behavior)
          image.resize(scale().width(width).height(height))
        } else {
          // Use fit to fill dimensions
          image.resize(fit().width(width).height(height))
        }
      } else if (width) {
        image.resize(scale().width(width))
      } else if (height) {
        image.resize(scale().height(height))
      }
    }

    // Apply auto quality for optimal file size
    image.quality(autoQuality())

    return image
  }

  return (
    <picture>
      {/* AVIF format source */}
      <source srcSet={generateSrcSet('avif')} sizes={sizes} type='image/avif' />

      {/* WebP format source */}
      <source srcSet={generateSrcSet('webp')} sizes={sizes} type='image/webp' />

      {/* Original format source */}
      <source srcSet={generateSrcSet()} sizes={sizes} />

      {/* Fallback img element */}
      <img
        className={className}
        src={createImageWithFormat().toURL()}
        width={width}
        height={height}
        {...props}
      />
    </picture>
  )
}

export default Image
