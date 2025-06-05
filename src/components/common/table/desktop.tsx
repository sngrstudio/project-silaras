import { type FC, type TableHTMLAttributes } from 'react'
import { flexRender, type Table } from '@tanstack/react-table'
import { clsx } from 'clsx/lite'
import ChevronUpIcon from '~icons/lucide/chevron-up'
import ChevronDownIcon from '~icons/lucide/chevron-down'
import ChevronsUpDownIcon from '~icons/lucide/chevrons-up-down'

export interface TableTemplateProps
  extends TableHTMLAttributes<HTMLTableElement> {
  table: Table<any>
}

/**
 * TableTemplate (Desktop)
 *
 * A reusable table component for rendering Tanstack Table data in a desktop/tablet layout.
 *
 * Props:
 * - table: Table<any> — The Tanstack Table instance to render.
 * - className: string (optional) — Additional class names for the table element.
 * - ...props: TableHTMLAttributes<HTMLTableElement> — Any other standard table element props.
 *
 * Usage:
 * `<TableTemplate table={tableInstance} className="my-table" />`
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
