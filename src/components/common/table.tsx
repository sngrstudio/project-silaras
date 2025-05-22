import { flexRender, type Table } from '@tanstack/react-table'

export interface TableTemplateProps<T> {
  table: Table<T>
  title?: string
}

export const TableTemplate = <T,>({ table, title }: TableTemplateProps<T>) => {
  return (
    <div>
      {title && <h3>{title}</h3>}
      <table className='table'>
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
    </div>
  )
}

export const MobileTableTemplate = <T,>({
  table,
  title
}: TableTemplateProps<T>) => {
  return (
    <div>
      {title && <h3>{title}</h3>}
      <ol>
        {table.getRowModel().rows.map((row) => (
          <li key={row.id} style={{ marginBottom: '1em' }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {row.getVisibleCells().map((cell) => (
                <li key={cell.id}>
                  <strong>{cell.column.columnDef.header as string}:</strong>{' '}
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}
