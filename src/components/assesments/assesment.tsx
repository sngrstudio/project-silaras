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
import { $currentUser } from '~/components/layout/drawer/drawer.store'

// Helper function to check if a date is in the future (after today)
const isDateInFuture = (date: Date | null | undefined): boolean => {
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate > today
}

const columnHelper = createColumnHelper<DailyAssesments[number]>()
const dColumns = [
  columnHelper.accessor('date', {
    header: 'Tanggal',
    cell: (cell) => {
      const date = cell.getValue()
      const dateString = date?.toLocaleDateString('id-ID', {
        dateStyle: 'full'
      })
      const isFuture = isDateInFuture(date)
      const assessment = cell.row.original
      const currentUser = useStore($currentUser)

      // Show metadata if assessment is completed, has been modified, and user has access level 3+
      const showMetadata =
        assessment.isCompleted &&
        assessment.lastModifiedAt &&
        assessment.lastModifiedBy &&
        currentUser &&
        currentUser.accessLevel >= 3

      return (
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <span className={`font-bold ${isFuture ? 'text-gray-400' : ''}`}>
              {dateString}
            </span>
            {isFuture && (
              <span className='badge badge-outline badge-sm text-gray-400'>
                Akan datang
              </span>
            )}
          </div>
          {showMetadata && (
            <div className='text-xs text-gray-500'>
              <div>
                terakhir diubah oleh{' '}
                {assessment.lastModifiedByUser?.fullName || 'Unknown'}
              </div>
              <div>
                pada{' '}
                {new Date(assessment.lastModifiedAt!).toLocaleString('id-ID')}
              </div>
            </div>
          )}
        </div>
      )
    }
  }),
  columnHelper.display({
    id: 'd-menu',
    header: 'Menu',
    cell: (cell) => {
      const menus = [cell.row.original.menu1, cell.row.original.menu2]
      const isFuture = isDateInFuture(cell.row.original.date)

      return (
        <div className='flex flex-col gap-y-1'>
          {menus.map((menu, i) => (
            <span
              className={`badge badge-soft badge-sm md:badge-md data-[menu=0]:badge-primary data-[menu=1]:badge-accent ${isFuture ? 'opacity-50' : ''}`}
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
    header: 'Penilaian & Foto',
    cell: (cell) => {
      const isFuture = isDateInFuture(cell.row.original.date)
      return (
        <AssesmentForm
          cell={cell}
          key={cell.row.original.dailyAssesmentId}
          isDisabled={isFuture}
        />
      )
    }
  }),
  columnHelper.accessor('score', {
    header: 'Skor',
    cell: (cell) => {
      return cell.getValue()
    }
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
