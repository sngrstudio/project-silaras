import { type FC } from 'react'
import TableTemplate from '../common/table/desktop'
import ListTemplate from '../common/table/mobile'
import MobileList from './mobile-list'
import Navigation from './navigation'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import { $regions, type Regions } from './region.store'

const columnHelper = createColumnHelper<Regions['data'][number]>()
const dColumns = [
  columnHelper.accessor('name', {
    header: '',
    cell: (cell) => cell.getValue()
  })
]
const mColumns = [
  columnHelper.display({
    id: 'mobile',
    cell: (cell) => <MobileList cell={cell} />
  })
]

const RegionRC: FC = () => {
  const regions = useStore($regions)

  if (!regions) {
    return <></>
  }

  return (
    <>
      <RegionTableRenderer regions={regions} />
      <Navigation />
    </>
  )
}

export default RegionRC

const RegionTableRenderer: FC<{ regions: Regions }> = ({ regions }) => {
  const dTable = useReactTable({
    columns: dColumns,
    data: regions.data,
    getCoreRowModel: getCoreRowModel()
  })

  const mTable = useReactTable({
    columns: mColumns,
    data: regions.data,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      <ListTemplate table={mTable} className='-mx-6 md:hidden' />
      <TableTemplate table={dTable} className='max-md:hidden' />
    </>
  )
}
