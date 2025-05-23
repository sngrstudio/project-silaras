import { Fragment, type FC } from 'react'
import { TableTemplate, MobileTableTemplate } from '../common/table'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import { $regions, type Regions } from './region.store'

const columnHelper = createColumnHelper<Regions[number]>()
const dColumns = [
  columnHelper.accessor('name', {
    header: '',
    cell: (cell) => cell.getValue()
  })
]
const mColumns = [
  columnHelper.accessor('name', {
    header: '',
    cell: (cell) => {
      const path = `/region/${cell.row.original.slug}`
      return (
        <Fragment>
          <div className='list-col-grow'>
            <a className='link' href={path}>
              {cell.getValue()}
            </a>
          </div>
        </Fragment>
      )
    }
  })
]

const RegionRC: FC = () => {
  const regions = useStore($regions)

  const dTable = useReactTable({
    columns: dColumns,
    data: regions,
    getCoreRowModel: getCoreRowModel()
  })

  const mTable = useReactTable({
    columns: mColumns,
    data: regions,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      <MobileTableTemplate table={mTable} className='md:hidden' />
      <TableTemplate table={dTable} className='max-md:hidden' />
    </>
  )
}

export default RegionRC
