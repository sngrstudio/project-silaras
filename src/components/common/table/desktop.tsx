import { type FC, type TableHTMLAttributes } from 'react'
import { flexRender, type Table } from '@tanstack/react-table'
import { clsx } from 'clsx/lite'

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
    <table className={clsx('table', className)} {...props}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TableTemplate
