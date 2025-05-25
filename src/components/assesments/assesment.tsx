import { type FC } from 'react'
import TableTemplate from '~/components/common/table/desktop'
import ListTemplate from '~/components/common/table/mobile'
import MobileList from './mobile-list'
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
    header: 'Nama',
    cell: (cell) => cell.getValue()?.toLocaleDateString()
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

  return <AssesmentTableRenderer data={dailyAssesments} />
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
