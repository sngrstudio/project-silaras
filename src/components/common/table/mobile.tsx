import { Fragment, type FC, type OlHTMLAttributes } from 'react'
import { flexRender, type Table } from '@tanstack/react-table'
import { clsx } from 'clsx/lite'

export interface ListTemplateProps extends OlHTMLAttributes<HTMLOListElement> {
  table: Table<any>
}

/**
 * ListTemplate (Mobile)
 *
 * A reusable list component for rendering Tanstack Table data as an ordered list (ol), suitable for mobile layouts.
 *
 * Props:
 * - table: Table<any> — The Tanstack Table instance to render.
 * - className: string (optional) — Additional class names for the list element.
 * - ...props: OlHTMLAttributes<HTMLOListElement> — Any other standard ol element props.
 *
 * Usage:
 * `<ListTemplate table={tableInstance} className="my-list" />`
 */
const ListTemplate: FC<ListTemplateProps> = ({ table, className }) => {
  return (
    <div className={clsx('space-y-3', className)}>
      {table.getRowModel().rows.map((row) => (
        <div
          key={row.id}
          className='card bg-base-100 border-base-300/50 border shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-lg'
        >
          <div className='card-body p-4'>
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
