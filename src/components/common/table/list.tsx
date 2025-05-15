import { type FC, type OlHTMLAttributes, Fragment } from 'react'
import { type Table, flexRender } from '@tanstack/react-table'
import clsx from 'clsx/lite'

interface ListTemplateProps extends OlHTMLAttributes<HTMLOListElement> {
  list: Table<any>
}

const ListTemplate: FC<ListTemplateProps> = ({ list, className, ...props }) => {
  return (
    <ol className={clsx('list', className)} {...props}>
      {list.getRowModel().rows.map((row) => (
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

export default ListTemplate
