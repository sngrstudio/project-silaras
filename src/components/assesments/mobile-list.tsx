/**
 * @fileoverview Mobile List Component for Daily Assessments
 *
 * Renders assessment data in a mobile-optimized card layout with interactive elements,
 * date-based styling, and assessment forms. Handles future date detection and provides
 * visual feedback for assessment completion status.
 *
 * @author SNGR Creative
 * @version 1.0.0
 */
import { type FC } from 'react'
import AssesmentForm from './assesment-form'
import { type CellContext } from '@tanstack/react-table'
import { type DailyAssesments } from './assesment.store'
import { useStore } from '@nanostores/react'
import { $currentUser } from '~/components/layout/drawer/drawer.store'
import CalendarIcon from '~icons/lucide/calendar'
import UtensilsIcon from '~icons/lucide/utensils'
import TrophyIcon from '~icons/lucide/trophy'
import ClockIcon from '~icons/lucide/clock'
import UserIcon from '~icons/lucide/user'
import clsx from 'clsx'

// Helper function to check if a date is in the future (after today)
/**
 * Helper function to check if a date is in the future (after today)
 *
 * @param date - The date to check, can be Date object, null, or undefined
 * @returns True if the date is after today (start of day), false otherwise
 *
 * @example
 * ```typescript
 * const tomorrow = new Date()
 * tomorrow.setDate(tomorrow.getDate() + 1)
 * console.log(isDateInFuture(tomorrow)) // true
 *
 * const yesterday = new Date()
 * yesterday.setDate(yesterday.getDate() - 1)
 * console.log(isDateInFuture(yesterday)) // false
 * ```
 */
const isDateInFuture = (date: Date | null | undefined): boolean => {
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate > today
}

/**
 * Props interface for the MobileList component
 *
 * @interface MobileListProps
 */
interface MobileListProps {
  /**
   * Table cell context containing assessment data and metadata.
   * Provides access to the current row's assessment information including
   * date, menus, completion status, and form data.
   */
  cell: CellContext<DailyAssesments[number], unknown>
}

/**
 * Mobile List Component for Daily Assessments
 *
 * Renders individual assessment entries in a mobile-optimized card format.
 * Each card displays assessment date, menu information, completion status,
 * and provides an embedded assessment form for data entry.
 *
 * Features:
 * - Future date detection with visual indicators
 * - Assessment completion status display
 * - Interactive assessment forms
 * - Menu information with color-coded badges
 * - Responsive card design with hover effects
 * - Date formatting with Indonesian locale
 *
 * @component
 * @param props - Component properties
 * @param props.cell - Table cell context with assessment data
 *
 * @example
 * ```tsx
 * // Used within a table renderer
 * const mColumns = [
 *   columnHelper.display({
 *     id: 'mobile',
 *     cell: (cell) => <MobileList cell={cell} />
 *   })
 * ]
 * ```
 *
 * @see {@link AssesmentForm} - Embedded form component
 * @see {@link DailyAssesments} - Assessment data type
 */
const MobileList: FC<MobileListProps> = ({ cell }) => {
  const assessment = cell.row.original
  const isFuture = isDateInFuture(assessment.date)
  const currentUser = useStore($currentUser)
  const maxScore = 5 // Assuming max score is 5 based on the assessment criteria
  const score = assessment.score || 0
  const percentage = (score / maxScore) * 100

  // Show metadata if assessment is completed, has been modified, and user has access level 3+
  const showMetadata =
    assessment.isCompleted &&
    assessment.lastModifiedAt &&
    assessment.lastModifiedBy &&
    currentUser &&
    currentUser.accessLevel >= 3

  return (
    <div className='flex flex-col gap-4'>
      {/* Header Section */}
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='mb-3 flex items-center gap-2'>
            <CalendarIcon
              className={clsx(
                'h-4 w-4',
                isFuture ? 'text-gray-400' : 'text-primary'
              )}
            />
            <div className='flex flex-col'>
              <span
                className={clsx(
                  'text-lg font-bold',
                  isFuture ? 'text-gray-400' : 'text-base-content'
                )}
              >
                {assessment.date?.toLocaleDateString('id-ID', {
                  dateStyle: 'full'
                })}
              </span>
              {isFuture && (
                <span className='badge badge-outline badge-sm mt-1 w-fit text-gray-400'>
                  Akan datang
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score Section */}
        <div className='flex flex-col items-end gap-1'>
          <div className='flex items-center gap-2'>
            <TrophyIcon className='text-warning h-4 w-4' />
            <span className='text-warning text-2xl font-bold'>{score}</span>
          </div>
          <div className='text-base-content/60 text-xs'>dari {maxScore}</div>
          <div className='bg-base-200 h-2 w-16 rounded-full'>
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
      </div>

      {/* Menu Section */}
      <div className='bg-base-200/30 rounded-lg p-3'>
        <div className='mb-2 flex items-center gap-2'>
          <UtensilsIcon className='text-secondary h-4 w-4' />
          <span className='text-base-content/80 text-sm font-semibold'>
            Menu Hari Ini
          </span>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <UtensilsIcon
              className={clsx('text-primary h-3 w-3', isFuture && 'opacity-50')}
            />
            <span
              className={clsx(
                'badge badge-sm rounded-full px-3 py-1 font-medium',
                'badge-primary bg-primary/20 text-primary border-primary/30',
                isFuture && 'opacity-50'
              )}
            >
              {assessment.menu1}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <UtensilsIcon
              className={clsx('text-accent h-3 w-3', isFuture && 'opacity-50')}
            />
            <span
              className={clsx(
                'badge badge-sm rounded-full px-3 py-1 font-medium',
                'badge-accent bg-accent/20 text-accent border-accent/30',
                isFuture && 'opacity-50'
              )}
            >
              {assessment.menu2}
            </span>
          </div>
        </div>
      </div>

      {/* Assessment Form Section */}
      <div
        className={clsx(
          'transition-all duration-200',
          isFuture && 'opacity-50'
        )}
      >
        <AssesmentForm
          cell={cell}
          key={assessment.dailyAssesmentId}
          isDisabled={isFuture}
        />
      </div>

      {/* Metadata Section */}
      {showMetadata && (
        <div className='bg-info/5 border-info/20 rounded-lg border p-3'>
          <div className='mb-2 flex items-center gap-2'>
            <ClockIcon className='text-info h-4 w-4' />
            <span className='text-info text-sm font-semibold'>
              Informasi Perubahan
            </span>
          </div>
          <div className='text-base-content/70 text-xs'>
            <div className='flex items-center gap-1'>
              <UserIcon className='text-base-content/50 h-3 w-3' />
              <span className='font-medium'>Diubah oleh:</span>
              <span>
                {assessment.lastModifiedByUser?.fullName || 'Unknown'}
              </span>
            </div>
            <div className='mt-1 flex items-center gap-1'>
              <ClockIcon className='text-base-content/50 h-3 w-3' />
              <span className='font-medium'>Pada:</span>
              <span>
                {new Date(assessment.lastModifiedAt!).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileList
