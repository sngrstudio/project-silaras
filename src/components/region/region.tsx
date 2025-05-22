import type { FC } from 'react'
import { TableTemplate } from '../common/table'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import { $regions, type Regions } from './region.store'

const columnHelper = createColumnHelper<Regions[number]>()
const columns = [
  columnHelper.accessor('name', {
    header: '',
    cell: (cell) => cell.getValue()
  })
]

const RegionRC: FC = () => {
  const regions = useStore($regions)

  const table = useReactTable({
    columns,
    data: regions,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      <TableTemplate title='Region' table={table} />
    </>
  )
}

export default RegionRC
