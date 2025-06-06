/**
 * @fileoverview Card Template Component
 *
 * A reusable card layout component providing consistent styling and interactive
 * effects for wrapping content throughout the application. Features modern
 * design with hover animations and gradient overlays.
 *
 * @author SNGR Creative
 * @version 1.0.0
 */
import type { FC, PropsWithChildren } from 'react'

/**
 * Props interface for the CardTemplate component
 *
 * @interface CardTemplateProps
 */
interface CardTemplateProps {
  /**
   * Optional title for the card header.
   * When provided, displays as a prominent heading with decorative elements.
   */
  title?: string | undefined
}

/**
 * Card Template Component
 *
 * A reusable card layout for wrapping content in a styled card UI with
 * modern design elements and interactive hover effects. Provides consistent
 * styling across the application with subtle animations and visual feedback.
 *
 * Design Features:
 * - Rounded borders with subtle shadows
 * - Gradient overlays that appear on hover
 * - Decorative title headers with animated elements
 * - Smooth transitions and hover effects
 * - Responsive design with proper spacing
 * - Modern card styling following design system
 *
 * @component
 * @param props - Component properties
 * @param props.children - Content to render inside the card body
 * @param props.title - Optional card title for the header
 *
 * @example
 * ```tsx
 * // Basic card without title
 * <CardTemplate>
 *   <p>Card content here</p>
 * </CardTemplate>
 *
 * // Card with title
 * <CardTemplate title="Settings">
 *   <form>...</form>
 * </CardTemplate>
 *
 * // Complex content
 * <CardTemplate title="User Statistics">
 *   <div className="stats">
 *     <div className="stat">...</div>
 *   </div>
 * </CardTemplate>
 * ```
 *
 * @see {@link https://daisyui.com/components/card/} - DaisyUI Card Documentation
 */
const CardTemplate: FC<PropsWithChildren<CardTemplateProps>> = ({
  children,
  title
}) => {
  return (
    <div className='card border-base-300/50 bg-base-100 group hover:border-primary/30 hover:shadow-primary/5 relative overflow-hidden border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
      {/* Subtle gradient overlay for depth */}
      <div className='from-base-100/50 to-base-200/30 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

      {/* Content container */}
      <div className='card-body relative z-10'>
        {title && (
          <h2 className='card-title text-base-content group-hover:text-primary mb-4 flex items-center gap-3 transition-colors duration-200'>
            <div className='bg-primary/10 border-primary/20 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300 group-hover:scale-110'>
              <div className='bg-primary h-2 w-2 rounded-full transition-all duration-300 group-hover:h-3 group-hover:w-3' />
            </div>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}

export default CardTemplate
