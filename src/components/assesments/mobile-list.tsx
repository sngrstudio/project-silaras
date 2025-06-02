import { type FC } from 'react'
import AssesmentForm from './assesment-form'
import { type CellContext } from '@tanstack/react-table'
import { type DailyAssesments } from './assesment.store'
import { useStore } from '@nanostores/react'
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

interface MobileListProps {
  cell: CellContext<DailyAssesments[number], unknown>
}

const MobileList: FC<MobileListProps> = ({ cell }) => {
  const currentUser = useStore($currentUser)
  const assessment = cell.row.original
  const isFuture = isDateInFuture(assessment.date)

  // Show metadata (timestamp and lastModifiedBy) only for users with access level 3 or above
  const canViewMetadata = currentUser && currentUser.accessLevel >= 3

  return (
    <>
      <div className='list-col-grow flex flex-col justify-start gap-y-1'>
        <div className='mb-2 flex items-center gap-2'>
          <span
            className={`text-lg font-bold ${isFuture ? 'text-gray-400' : ''}`}
          >
            {assessment.date?.toLocaleDateString('id-ID', {
              dateStyle: 'full'
            })}
          </span>
          {isFuture && (
            <span className='badge badge-outline badge-sm text-gray-400'>
              Akan datang
            </span>
          )}
        </div>
        <div
          className={`badge badge-soft badge-sm badge-primary rounded-full ${isFuture ? 'opacity-50' : ''}`}
        >
          {assessment.menu1}
        </div>
        <div
          className={`badge badge-soft badge-sm badge-accent rounded-full ${isFuture ? 'opacity-50' : ''}`}
        >
          {assessment.menu2}
        </div>

        {/* Mobile metadata display for authorized users */}
        {canViewMetadata &&
          (assessment.createdAt || assessment.lastModifiedBy) && (
            <div className='mt-2 text-xs text-gray-500'>
              {assessment.createdAt && (
                <div>
                  Dibuat:{' '}
                  {new Date(assessment.createdAt).toLocaleString('id-ID')}
                </div>
              )}
              {assessment.lastModifiedBy && (
                <div>
                  Terakhir diubah:{' '}
                  {assessment.lastModifiedByUser?.fullName || 'Unknown'}
                </div>
              )}
            </div>
          )}
      </div>

      <div className='list-col-wrap'>
        <AssesmentForm
          cell={cell}
          key={assessment.dailyAssesmentId}
          isDisabled={isFuture}
        />
      </div>

      <div>
        <div className='stats'>
          <div className='stat'>
            <div className='stat-value'>{assessment.score}</div>
            <div className='stat-desc'>Skor</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileList
