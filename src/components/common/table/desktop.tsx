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
        'border-base-300 bg-base-100 overflow-hidden rounded-xl border shadow-lg',
        className
      )}
    >
      <div className='overflow-x-auto'>
        <table className='table w-full min-w-[640px]' {...props}>
          <thead className='from-base-200 to-base-300 bg-gradient-to-r'>
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
                          'flex items-center gap-2 transition-colors duration-200',
                          header.column.getCanSort() &&
                            'hover:text-primary hover:bg-base-300/20 -mx-2 -my-1 cursor-pointer rounded-md px-2 py-1 select-none'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className='ml-1 transition-transform duration-200'>
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
                  'hover:bg-base-200/30 transition-colors duration-200',
                  index % 2 === 0 ? 'bg-base-100' : 'bg-base-50/30'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className='border-base-300/20 border-b px-6 py-4 align-top'
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
