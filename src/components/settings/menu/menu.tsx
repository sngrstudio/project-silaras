import { type FC } from 'react'
import TableTemplate from '~/components/common/table/desktop'
import ListTemplate from '~/components/common/table/mobile'
import MobileList from './mobile-list'
import Navigation from './navigation'
import MenuForm from './menu-form'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import {
  $dailyAssesmentsSettings,
  type DailyAssesmentsSettings
} from './menu.store'

const columnHelper = createColumnHelper<DailyAssesmentsSettings[number]>()
const dColumns = [
  columnHelper.accessor('date', {
    header: 'Tanggal',
    cell: (cell) => {
      const date = cell
        .getValue()
        ?.toLocaleDateString('id-ID', { dateStyle: 'full' })

      return <span className='font-bold'>{date}</span>
    }
  }),
  columnHelper.display({
    id: 'd-form',
    header: 'Menu',
    cell: (cell) => <MenuForm cell={cell} key={cell.row.original.id} />
  })
]
const mColumns = [
  columnHelper.display({
    id: 'mobile',
    cell: (cell) => <MobileList cell={cell} />
  })
]

const MenuRC: FC = () => {
  const dailyAssesments = useStore($dailyAssesmentsSettings)
  if (!dailyAssesments) return <></>

  return (
    <>
      <div className='card-actions mt-8 flex-row-reverse'>
        <Navigation />
      </div>
      <MenuTableRenderer data={dailyAssesments} />
    </>
  )
}

export default MenuRC

const MenuTableRenderer: FC<{ data: DailyAssesmentsSettings }> = ({ data }) => {
  const dTable = useReactTable({
    columns: dColumns,
    data,
    getCoreRowModel: getCoreRowModel()
  })
  const mTable = useReactTable({
    columns: mColumns,
    data,
    getCoreRowModel: getCoreRowModel()
  })
  return (
    <>
      <ListTemplate table={mTable} className='-mx-6 md:hidden' />
      <TableTemplate table={dTable} className='max-md:hidden' />
    </>
  )
}
