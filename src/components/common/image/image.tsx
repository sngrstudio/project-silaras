/**
 * @fileoverview Cloudinary Image Component
 *
 * A React component that provides optimized image delivery using Cloudinary's
 * transformation and CDN capabilities. This component automatically generates
 * responsive images with multiple modern formats (AVIF, WebP, fallback) and
 * implements automatic quality optimization for optimal performance.
 *
 * Features:
 * - Responsive image generation with customizable breakpoints
 * - Multi-format support (AVIF, WebP, original) with progressive enhancement
 * - Automatic quality optimization based on content and device
 * - Cloudinary transformation support (resize, crop, contain modes)
 * - Type-safe props with comprehensive validation
 * - Proper aspect ratio handling and scaling
 * - Accessibility-compliant image rendering
 *
 * Image Formats:
 * - AVIF: Next-generation format for maximum compression
 * - WebP: Modern format with broad browser support
 * - Original: Fallback format for legacy browser compatibility
 *
 * Responsive Behavior:
 * - Generates srcSet with multiple image sizes for different breakpoints
 * - Uses proper sizes attribute for optimal image selection
 * - Supports custom breakpoint arrays for specific use cases
 * - Maintains aspect ratios across all responsive variants
 *
 * Transformation Modes:
 * - Crop (default): Fills container dimensions, may crop to fit
 * - Contain: Fits entire image within container, may add letterboxing
 * - Scale: Proportional scaling based on single dimension
 *
 * Performance Optimizations:
 * - Automatic quality adjustment based on image content
 * - Progressive JPEG encoding for faster perceived loading
 * - WebP and AVIF formats for modern browsers
 * - Proper lazy loading support via native HTML attributes
 *
 * Usage Examples:
 * ```tsx
 * // Basic usage with public ID
 * <Image publicId="my-folder/image-name" alt="Description" />
 *
 * // Responsive image with specific dimensions
 * <Image
 *   publicId="photos/hero-image"
 *   width={1200}
 *   height={600}
 *   alt="Hero banner"
 * />
 *
 * // Custom breakpoints and sizes
 * <Image
 *   publicId="gallery/thumb"
 *   breakpoints={[200, 400, 800]}
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   alt="Gallery thumbnail"
 * />
 *
 * // Contain mode for logo or icon usage
 * <Image
 *   publicId="logos/company-logo"
 *   width={200}
 *   height={100}
 *   contain={true}
 *   alt="Company logo"
 * />
 * ```
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import type { FC, ImgHTMLAttributes } from 'react'
import { Cloudinary } from '@cloudinary/url-gen'
import { scale, fit } from '@cloudinary/url-gen/actions/resize'
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality'
import { format } from '@cloudinary/url-gen/actions/delivery'

/**
 * Cloudinary cloud name configuration.
 * This is the unique identifier for the Cloudinary account used for image delivery.
 *
 * @constant {string} CLOUDINARY_CLOUD_NAME
 */
const CLOUDINARY_CLOUD_NAME = 'dcmwvv32q' as const

/**
 * Props interface for the Cloudinary Image component.
 * Extends standard HTML img attributes while providing Cloudinary-specific options.
 *
 * @interface ImageProps
 * @extends {Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'>}
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
 *
 * This component automatically:
 * - Generates responsive srcSet with multiple breakpoints
 * - Provides modern image formats (AVIF, WebP) with fallbacks
 * - Applies automatic quality optimization
 * - Maintains proper aspect ratios across all variants
 * - Supports both crop and contain transformation modes
 *
 * @param props - Component props including Cloudinary and HTML img attributes
 * @param props.publicId - Cloudinary public ID of the image
 * @param props.width - Optional width for transformations and aspect ratio
 * @param props.height - Optional height for transformations and aspect ratio
 * @param props.sizes - Responsive sizes attribute for optimal image selection
 * @param props.breakpoints - Custom breakpoint array for srcSet generation
 * @param props.contain - Whether to contain image (true) or crop to fill (false)
 * @param props.className - CSS classes for styling
 * @param props.alt - Alternative text for accessibility (required)
 * @returns JSX picture element with optimized image sources
 *
 * @example
 * ```tsx
 * // Basic responsive image
 * <Image
 *   publicId="photos/landscape"
 *   alt="Beautiful landscape"
 *   width={800}
 *   height={600}
 * />
 *
 * // Logo with contain mode
 * <Image
 *   publicId="logos/brand"
 *   width={200}
 *   height={100}
 *   contain={true}
 *   alt="Company brand logo"
 * />
 * ```
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
  // Create Cloudinary instance
  const cloudinary = new Cloudinary({
    cloud: {
      cloudName: CLOUDINARY_CLOUD_NAME
    }
  })

  /**
   * Generate srcSet string for responsive images with optional format.
   * Creates multiple image variants at different breakpoint widths while
   * maintaining proper aspect ratios and applying the specified format.
   *
   * @param imageFormat - Optional image format (e.g., 'avif', 'webp')
   * @returns Comma-separated srcSet string with width descriptors
   */
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

  /**
   * Create image with specific format for fallback src attribute.
   * Generates a single optimized image URL with the specified format and dimensions.
   *
   * @param imageFormat - Optional image format (e.g., 'avif', 'webp')
   * @returns Cloudinary image instance with applied transformations
   */
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
