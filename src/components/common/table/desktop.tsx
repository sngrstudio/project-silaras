/**
 * @fileoverview Desktop Table Template Component
 *
 * A reusable table component for rendering Tanstack Table data in desktop/tablet layouts.
 * Provides enhanced styling, sorting functionality, and responsive design with hover effects
 * and gradient overlays for improved user experience.
 *
 * Features:
 * - Interactive column sorting with visual indicators
 * - Hover effects with gradient overlays
 * - Responsive design optimized for larger screens
 * - Accessibility-compliant table structure
 * - Smooth transitions and animations
 * - Shadow effects and border styling
 *
 * @author SNGR Creative
 * @version 1.0.0
 */
import { type FC, type TableHTMLAttributes } from 'react'
import { flexRender, type Table } from '@tanstack/react-table'
import { clsx } from 'clsx/lite'
import ChevronUpIcon from '~icons/lucide/chevron-up'
import ChevronDownIcon from '~icons/lucide/chevron-down'
import ChevronsUpDownIcon from '~icons/lucide/chevrons-up-down'

/**
 * Props interface for the TableTemplate component
 *
 * @interface TableTemplateProps
 */
export interface TableTemplateProps
  extends TableHTMLAttributes<HTMLTableElement> {
  /**
   * The Tanstack Table instance to render.
   * Contains all table data, columns, and state management.
   */
  table: Table<any>
}

/**
 * Desktop Table Template Component
 *
 * A reusable table component for rendering Tanstack Table data in a desktop/tablet layout.
 * Features interactive sorting, hover effects, and modern styling consistent with the
 * application's design system.
 *
 * Design Features:
 * - Rounded container with subtle borders and shadows
 * - Gradient overlay on hover for enhanced interactivity
 * - Interactive column headers with sort indicators
 * - Alternating row colors for improved readability
 * - Smooth transitions and hover effects
 * - Mobile-responsive with horizontal scrolling
 *
 * @component
 * @param props - Component properties
 * @param props.table - Tanstack Table instance with data and configuration
 * @param props.className - Additional CSS classes for styling customization
 * @param props...props - Standard table HTML attributes
 *
 * @example
 * ```tsx
 * // Basic usage with table instance
 * <TableTemplate
 *   table={tableInstance}
 *   className="my-custom-table"
 * />
 *
 * // With sorting enabled
 * const table = useReactTable({
 *   data,
 *   columns,
 *   getCoreRowModel: getCoreRowModel(),
 *   getSortedRowModel: getSortedRowModel(),
 *   state: { sorting },
 *   onSortingChange: setSorting
 * })
 *
 * <TableTemplate table={table} />
 * ```
 *
 * @see {@link Table} - Tanstack Table type
 * @see {@link ListTemplate} - Mobile table counterpart
 */
const TableTemplate: FC<TableTemplateProps> = ({
  table,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'border-base-300/50 bg-base-100 group hover:shadow-primary/5 relative overflow-hidden rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className='from-primary/5 to-accent/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

      <div className='overflow-x-auto'>
        <table className='relative z-10 table w-full min-w-[640px]' {...props}>
          <thead className='from-base-200/80 to-base-300/80 bg-gradient-to-r backdrop-blur-sm'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className='border-base-300/50 text-base-content border-b px-6 py-4 font-semibold'
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={clsx(
                          'flex items-center gap-2 transition-all duration-200',
                          header.column.getCanSort() &&
                            'hover:text-primary hover:bg-primary/10 group -mx-2 -my-1 cursor-pointer rounded-lg px-2 py-1 select-none'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className='ml-1 transition-all duration-200 group-hover:scale-110'>
                            {header.column.getIsSorted() === 'desc' ? (
                              <ChevronDownIcon className='text-primary h-4 w-4' />
                            ) : header.column.getIsSorted() === 'asc' ? (
                              <ChevronUpIcon className='text-primary h-4 w-4' />
                            ) : (
                              <ChevronsUpDownIcon className='h-4 w-4 opacity-50 group-hover:opacity-100' />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='divide-base-300/30 divide-y'>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={clsx(
                  'hover:bg-base-200/50 group transition-all duration-200 hover:shadow-sm',
                  index % 2 === 0 ? 'bg-base-100' : 'bg-base-50/30'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className='border-base-300/20 group-hover:border-primary/20 border-b px-6 py-4 align-top transition-all duration-200'
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableTemplate
