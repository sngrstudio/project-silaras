/**
 * @fileoverview Mobile List Template Component
 *
 * A reusable list component for rendering Tanstack Table data in mobile-optimized
 * card layouts. Provides responsive design with enhanced visual effects, hover
 * animations, and accessibility features optimized for touch interfaces.
 *
 * Features:
 * - Card-based layout optimized for mobile screens
 * - Gradient overlays and hover animations
 * - Accent borders with smooth scaling effects
 * - Touch-friendly spacing and sizing
 * - Accessibility-compliant structure
 * - Modern design with shadow effects
 *
 * @author SNGR Creative
 * @version 1.0.0
 */
import { Fragment, type FC, type OlHTMLAttributes } from 'react'
import { flexRender, type Table } from '@tanstack/react-table'
import { clsx } from 'clsx/lite'

/**
 * Props interface for the ListTemplate component
 *
 * @interface ListTemplateProps
 */
export interface ListTemplateProps extends OlHTMLAttributes<HTMLOListElement> {
  /**
   * The Tanstack Table instance to render.
   * Contains all table data, columns, and state management for mobile display.
   */
  table: Table<any>
}

/**
 * Mobile List Template Component
 *
 * A reusable list component for rendering Tanstack Table data as an ordered list,
 * specifically designed for mobile layouts. Each row is rendered as an interactive
 * card with hover effects and modern styling.
 *
 * Design Features:
 * - Card-based layout with rounded corners and shadows
 * - Gradient overlays that appear on hover
 * - Colored accent borders with scaling animations
 * - Optimized spacing for touch interaction
 * - Responsive design that adapts to screen size
 * - Smooth transitions and micro-interactions
 *
 * @component
 * @param props - Component properties
 * @param props.table - Tanstack Table instance with data and configuration
 * @param props.className - Additional CSS classes for styling customization
 * @param props...props - Standard ordered list HTML attributes
 *
 * @example
 * ```tsx
 * // Basic usage with mobile table
 * <ListTemplate
 *   table={mobileTableInstance}
 *   className="my-mobile-list"
 * />
 *
 * // Common pattern with responsive tables
 * return (
 *   <>
 *     <ListTemplate table={mTable} className="-mx-6 md:hidden" />
 *     <TableTemplate table={dTable} className="max-md:hidden" />
 *   </>
 * )
 * ```
 *
 * @see {@link Table} - Tanstack Table type
 * @see {@link TableTemplate} - Desktop table counterpart
 */
const ListTemplate: FC<ListTemplateProps> = ({ table, className }) => {
  return (
    <div className={clsx('space-y-4', className)}>
      {table.getRowModel().rows.map((row) => (
        <div
          key={row.id}
          className='card bg-base-100 border-base-300/50 group hover:border-primary/30 hover:shadow-primary/5 relative overflow-hidden border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
        >
          {/* Subtle gradient overlay */}
          <div className='from-primary/5 to-accent/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

          {/* Left accent border */}
          <div className='bg-primary absolute top-0 left-0 h-full w-1 scale-y-0 transition-transform duration-300 group-hover:scale-y-100' />

          <div className='card-body relative z-10 p-4'>
            {row.getVisibleCells().map((cell) => (
              <Fragment key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ListTemplate
