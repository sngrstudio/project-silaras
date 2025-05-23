import {
  Fragment,
  type FC,
  type OlHTMLAttributes,
  type TableHTMLAttributes
} from 'react'
import { flexRender, type Table } from '@tanstack/react-table'
import { clsx } from 'clsx/lite'

export interface TableTemplateProps
  extends TableHTMLAttributes<HTMLTableElement> {
  table: Table<any>
}

export const TableTemplate: FC<TableTemplateProps> = ({
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

export interface MobileTableTemplateProps
  extends OlHTMLAttributes<HTMLOListElement> {
  table: Table<any>
}

export const MobileTableTemplate: FC<MobileTableTemplateProps> = ({
  table,
  className,
  ...props
}) => {
  return (
    <ol className={clsx('list', className)} {...props}>
      {table.getRowModel().rows.map((row) => (
        <li className='list-row' key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <Fragment key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Fragment>
          ))}
        </li>
      ))}
    </ol>
  )
}
