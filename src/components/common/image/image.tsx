import type { FC, ImgHTMLAttributes } from 'react'
import { Cloudinary } from '@cloudinary/url-gen'
import { scale } from '@cloudinary/url-gen/actions/resize'
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality'

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
}

const Image: FC<ImageProps> = ({
  publicId,
  width,
  height,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  breakpoints = [320, 640, 768, 1024, 1280, 1536],
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

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    return breakpoints
      .map((breakpointWidth) => {
        const image = cloudinary.image(publicId)

        // Apply dimensions based on breakpoint
        if (width || height) {
          if (width && height) {
            // Scale proportionally based on the breakpoint
            const aspectRatio = height / width
            const scaledHeight = Math.round(breakpointWidth * aspectRatio)
            image.resize(scale().width(breakpointWidth).height(scaledHeight))
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

  // Create the main image with original dimensions
  const mainImage = cloudinary.image(publicId)

  // Apply dimensions if provided
  if (width || height) {
    if (width && height) {
      mainImage.resize(scale().width(width).height(height))
    } else if (width) {
      mainImage.resize(scale().width(width))
    } else if (height) {
      mainImage.resize(scale().height(height))
    }
  }

  // Apply auto quality for optimal file size
  mainImage.quality(autoQuality())

  return (
    <img
      className={className}
      src={mainImage.toURL()}
      srcSet={generateSrcSet()}
      sizes={sizes}
      width={width}
      height={height}
      {...props}
    />
  )
}

export default Image
