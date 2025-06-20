/**
 * @fileoverview Assessment Management Component
 *
 * This component provides a comprehensive interface for managing daily assessments within the SILARAS platform.
 * It features a responsive table/list view with sorting capabilities, assessment creation and editing,
 * and role-based access controls for different user permissions.
 *
 * Key Features:
 * - Responsive design with desktop table and mobile list views
 * - Real-time assessment data synchronization using nanostores
 * - Assessment creation, editing, and deletion capabilities
 * - Role-based access control for assessment management
 * - Sorting and filtering capabilities for assessment data
 * - Assessment completion tracking and statistics
 *
 * Security Features:
 * - User role verification before allowing assessment modifications
 * - Region-based access control for assessment visibility
 * - Sanitized assessment data handling
 *
 * @module Components/Assessments
 * @author SNGR Creative
 * @since 1.0.0
 */
// filepath: /workspaces/project-dashat/src/components/assesments/assesment.tsx

import { type FC, useState, useMemo } from 'react'
import TableTemplate from '~/components/common/table/desktop'
import ListTemplate from '~/components/common/table/mobile'
import MobileList from './mobile-list'
import AssesmentForm from './assesment-form'
import Navigation from './navigation'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import { $dailyAssesments, type DailyAssesments } from './assesment.store'
import { $currentUser } from '~/components/layout/drawer/drawer.store'
import CalendarIcon from '~icons/lucide/calendar'
import UtensilsIcon from '~icons/lucide/utensils'
import CheckSquareIcon from '~icons/lucide/check-square'
import TrophyIcon from '~icons/lucide/trophy'
import clsx from 'clsx'

// Helper function to check if a date is in the future (after today)
const isDateInFuture = (date: Date | null | undefined): boolean => {
  // If ENABLE_FUTURE environment variable is set to true, allow all entries
  if (process.env.ENABLE_FUTURE) {
    return false
  }

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
    header: () => (
      <div className='flex items-center gap-2'>
        <CalendarIcon className='text-primary h-4 w-4' />
        <span>Tanggal & Menu</span>
      </div>
    ),
    enableSorting: true,
    cell: (cell) => {
      const date = cell.getValue()
      const dateString = date?.toLocaleDateString('id-ID', {
        dateStyle: 'full'
      })
      const isFuture = isDateInFuture(date)
      const assessment = cell.row.original
      const currentUser = useStore($currentUser)

      const menus = [
        { name: cell.row.original.menu1, type: 'primary' },
        { name: cell.row.original.menu2, type: 'accent' }
      ]

      // Show metadata if assessment is completed, has been modified, and user has access level 3+
      const showMetadata =
        assessment.isCompleted &&
        assessment.lastModifiedAt &&
        assessment.lastModifiedBy &&
        currentUser &&
        currentUser.accessLevel >= 3

      return (
        <div className='flex flex-col gap-3'>
          {/* Date */}
          <div className='flex items-center gap-2'>
            <CalendarIcon
              className={clsx(
                'h-4 w-4',
                isFuture ? 'text-gray-400' : 'text-primary'
              )}
            />
            <div className='flex flex-col'>
              <span
                className={clsx(
                  'font-semibold',
                  isFuture ? 'text-gray-400' : 'text-base-content'
                )}
              >
                {dateString}
              </span>
              {isFuture && (
                <span className='badge badge-outline badge-sm w-fit text-gray-400'>
                  Akan datang
                </span>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className='flex flex-col gap-2'>
            {menus.map((menu, i) => (
              <div key={i} className='flex items-center gap-2'>
                <UtensilsIcon
                  className={clsx(
                    'h-3 w-3',
                    i === 0 ? 'text-primary' : 'text-accent',
                    isFuture && 'opacity-50'
                  )}
                />
                <span
                  className={clsx(
                    'badge badge-sm rounded-full px-3 py-1 font-medium',
                    i === 0
                      ? 'badge-primary bg-primary/20 text-primary border-primary/30'
                      : 'badge-accent bg-accent/20 text-accent border-accent/30',
                    isFuture && 'opacity-50'
                  )}
                >
                  {menu.name}
                </span>
              </div>
            ))}
          </div>

          {/* Modified By */}
          {showMetadata && (
            <div className='bg-base-200/50 text-base-content/70 rounded-lg p-2 text-xs'>
              <div className='flex items-center gap-1'>
                <span className='font-medium'>Diubah:</span>
                <span>
                  {assessment.lastModifiedByUser?.fullName || 'Unknown'}
                </span>
              </div>
              <div className='text-base-content/50'>
                {new Date(assessment.lastModifiedAt!).toLocaleString('id-ID')}
              </div>
            </div>
          )}
        </div>
      )
    }
  }),
  columnHelper.display({
    id: 'd-assesment',
    header: () => (
      <div className='flex items-center gap-2'>
        <CheckSquareIcon className='text-info h-4 w-4' />
        <span>Penilaian & Foto</span>
      </div>
    ),
    cell: (cell) => {
      const isFuture = isDateInFuture(cell.row.original.date)
      return (
        <div
          className={clsx(
            'transition-all duration-200',
            isFuture && 'opacity-50'
          )}
        >
          <AssesmentForm
            cell={cell}
            key={cell.row.original.dailyAssesmentId}
            isDisabled={isFuture}
          />
        </div>
      )
    }
  }),
  columnHelper.accessor('score', {
    header: () => (
      <div className='flex items-center gap-2'>
        <TrophyIcon className='text-warning h-4 w-4' />
        <span>Skor</span>
      </div>
    ),
    enableSorting: true,
    cell: (cell) => {
      const score = cell.getValue()
      const maxScore = 5 // Assuming max score is 5 based on the assessment criteria
      const percentage = score ? (score / maxScore) * 100 : 0

      return (
        <div className='flex flex-col items-center gap-1'>
          <div className='stats stats-vertical w-full'>
            <div className='stat p-2'>
              <div className='stat-value text-warning text-2xl font-bold'>
                {score || 0}
              </div>
              <div className='stat-desc text-xs'>dari {maxScore}</div>
            </div>
          </div>
          <div className='bg-base-200 h-2 w-full rounded-full'>
            <div
              className={clsx(
                'h-2 rounded-full transition-all duration-300',
                percentage >= 80
                  ? 'bg-success'
                  : percentage >= 60
                    ? 'bg-warning'
                    : 'bg-error'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )
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

  if (!dailyAssesments) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='flex flex-col items-center gap-4'>
          <div className='loading loading-spinner loading-lg text-primary'></div>
          <span className='text-base-content/60'>Memuat data asesmen...</span>
        </div>
      </div>
    )
  }

  if (dailyAssesments.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-12 text-center'>
        <CalendarIcon className='text-base-content/30 mb-4 h-16 w-16' />
        <h3 className='text-base-content/70 mb-2 text-xl font-semibold'>
          Belum Ada Data Asesmen
        </h3>
        <p className='text-base-content/50 max-w-md'>
          Data asesmen untuk bulan ini belum tersedia. Silakan pilih bulan lain
          atau tunggu hingga data tersedia.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='card-actions mt-8 flex-row-reverse'>
        <Navigation />
      </div>
      <div className='mt-6'>
        <AssesmentTableRenderer data={dailyAssesments} />
      </div>
    </>
  )
}

export default AssesmentRC

const AssesmentTableRenderer: FC<{ data: DailyAssesments }> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: false }
  ])

  // Sort data manually for mobile table since mobile only has display column
  const sortedData = useMemo(() => {
    if (!sorting.length) return data

    return [...data].sort((a, b) => {
      for (const sort of sorting) {
        let aValue: any
        let bValue: any

        switch (sort.id) {
          case 'date':
            aValue = a.date ? new Date(a.date).getTime() : 0
            bValue = b.date ? new Date(b.date).getTime() : 0
            break
          case 'score':
            aValue = a.score || 0
            bValue = b.score || 0
            break
          default:
            continue
        }

        if (aValue < bValue) return sort.desc ? 1 : -1
        if (aValue > bValue) return sort.desc ? -1 : 1
      }
      return 0
    })
  }, [data, sorting])

  const dTable = useReactTable({
    columns: dColumns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting
  })

  const mTable = useReactTable({
    columns: mColumns,
    data: sortedData,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      <ListTemplate table={mTable} className='-mx-6 md:hidden' />
      <TableTemplate table={dTable} className='max-md:hidden' />
    </>
  )
}
