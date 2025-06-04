import type { FC, ImgHTMLAttributes } from 'react'
import { Cloudinary } from '@cloudinary/url-gen'
import { scale, fit } from '@cloudinary/url-gen/actions/resize'
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality'
import { format } from '@cloudinary/url-gen/actions/delivery'

interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /** Cloudinary public ID of the image */
  publicId: string
  /** Width of the image in pixels */
  width?: number
  /** Height of the image in pixels */
  height?: number
  /** Sizes attribute for responsive images (defaults to responsive breakpoints) */
  sizes?: string
  /** Custom breakpoints for srcSet generation (defaults to common breakpoints) */
  breakpoints?: number[]
  /** Whether to contain the image (object-fit: contain) instead of cropping. Default: false (crop/fill) */
  contain?: boolean
}

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
  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    console.error('PUBLIC_CLOUDINARY_CLOUD_NAME is not set')
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
              image.resize(scale().width(breakpointWidth).height(scaledHeight))
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
