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
