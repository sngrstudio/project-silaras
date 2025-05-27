import { type FC } from 'react'
import TableTemplate from '~/components/common/table/desktop'
import ListTemplate from '~/components/common/table/mobile'
import MobileList from './mobile-list'
import AssesmentForm from './assesment-form'
import Navigation from './navigation'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import { $dailyAssesments, type DailyAssesments } from './assesment.store'

const columnHelper = createColumnHelper<DailyAssesments[number]>()
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
    id: 'd-menu',
    header: 'Menu',
    cell: (cell) => {
      const menus = [cell.row.original.menu1, cell.row.original.menu2]

      return (
        <div className='flex flex-col gap-y-1'>
          {menus.map((menu, i) => (
            <span
              className='badge badge-soft badge-sm data-[menu=0]:badge-primary data-[menu=1]:badge-accent'
              data-menu={i}
              key={i}
            >
              {menu}
            </span>
          ))}
        </div>
      )
    }
  }),
  columnHelper.display({
    id: 'd-assesment',
    header: 'Penilaian',
    cell: (cell) => {
      return <AssesmentForm cell={cell} />
    }
  }),
  columnHelper.accessor('score', {
    header: 'Skor',
    cell: (cell) => cell.getValue()
  })
]
const mColumns = [
  columnHelper.display({
    id: 'mobile',
    cell: (cell) => <MobileList cell={cell} />
  })
]

const AssesmentRC: FC = () => {
  const dailyAssesments = useStore($dailyAssesments)
  if (!dailyAssesments) return <></>

  return (
    <>
      <div className='card-actions mt-8 flex-row-reverse'>
        <Navigation />
      </div>
      <AssesmentTableRenderer data={dailyAssesments} />
    </>
  )
}

export default AssesmentRC

const AssesmentTableRenderer: FC<{ data: DailyAssesments }> = ({ data }) => {
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
