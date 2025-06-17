/**
 * @fileoverview Assessment Statistics Component
 *
 * This component provides comprehensive monthly assessment statistics and progress tracking
 * for the SILARAS platform. It displays assessment completion rates, progress bars,
 * and monthly overviews with interactive data visualization.
 *
 * Key Features:
 * - Monthly assessment progress tracking
 * - Real-time completion percentage calculations
 * - Interactive monthly navigation and overview
 * - Visual progress indicators and completion status
 * - Assessment completion notifications and feedback
 * - Monthly assessment data synchronization
 *
 * Performance Features:
 * - Optimized data rendering for large assessment datasets
 * - Efficient progress calculation algorithms
 * - Cached monthly assessment data
 *
 * @module Components/Assessments
 * @author SNGR Creative
 * @since 1.0.0
 */
// filepath: /workspaces/project-dashat/src/components/assesments/assesment-stat.tsx
import { type FC, useActionState, useRef, useState, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import clsx from 'clsx'
import {
  $monthlyAssesments,
  setMonthlyAssesment,
  $currentMonthIndex,
  $dailyAssesments
} from './assesment.store'
import { actions } from 'astro:actions'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'

interface CompletionProgress {
  completed: number
  total: number
  percentage: number
}

interface MetricsComparison {
  deltas: {
    weight: number
    height: number
    bmi: number
    score: number
  }
  currentScore: number
}

interface TargetData {
  id: string
  name: string
  age: number | null // age in months
  birthDate: Date // birth date as Date object
}

// BMI classification according to WHO standards
const getBMIClassification = (bmi: number) => {
  if (bmi < 18.5) return { category: 'Kurus', color: 'text-warning' }
  if (bmi < 25) return { category: 'Normal', color: 'text-success' }
  if (bmi < 30) return { category: 'Kegemukan', color: 'text-warning' }
  return { category: 'Obesitas', color: 'text-error' }
}

// Score classification based on completion and score
const getScoreClassification = (
  score: number,
  completionPercentage: number
) => {
  // If completion is under 75%, show "On Progress"
  if (completionPercentage < 75) {
    return { category: 'On Progress', color: 'text-base-content' }
  }

  // Calculate adjusted thresholds based on completion percentage
  // At 100% completion: >=120 = Terbiasa, >=90 = Pendampingan, <90 = Pendampingan & Penguatan
  const completionRatio = completionPercentage / 100
  const adjustedHighThreshold = 120 * completionRatio // 120 at 100% completion, 90 at 75% completion
  const adjustedMidThreshold = 90 * completionRatio // 90 at 100% completion, 67.5 at 75% completion

  if (score >= adjustedHighThreshold) {
    return { category: 'Terbiasa', color: 'text-success' }
  }
  if (score >= adjustedMidThreshold) {
    return { category: 'Butuh Pendampingan', color: 'text-warning' }
  }
  return { category: 'Butuh Pendampingan dan Penguatan', color: 'text-error' }
}

// Format age display based on age in months
const formatAge = (ageInMonths: number | null) => {
  if (!ageInMonths || ageInMonths < 0) {
    return '-'
  }

  if (ageInMonths < 24) {
    return ageInMonths.toString()
  }

  const years = Math.floor(ageInMonths / 12)
  const remainingMonths = ageInMonths % 12

  // For 2yo and above, only show years if no remaining months
  if (remainingMonths === 0) {
    return years.toString()
  }

  return `${years}.${remainingMonths}`
}

// Calculate age in months as of a specific assessment month
const calculateAgeAtMonth = (birthDate: Date, monthIndex: number): number => {
  // Create a date for the assessment month in 2025
  // monthIndex is 1-based (1=January, 12=December)
  const assessmentDate = new Date(2025, monthIndex - 1, 1) // Use first day of the assessment month

  // Calculate months difference
  const monthsDiff =
    (assessmentDate.getFullYear() - birthDate.getFullYear()) * 12 +
    (assessmentDate.getMonth() - birthDate.getMonth())

  return Math.max(0, monthsDiff) // Ensure non-negative age
}

const AssesmentStatRC: FC = () => {
  const monthlyAssesments = useStore($monthlyAssesments)
  const currentMonthIndex = useStore($currentMonthIndex)
  const dailyAssesments = useStore($dailyAssesments)
  const formRef = useRef<HTMLFormElement>(null)
  const [completionProgress, setCompletionProgress] =
    useState<CompletionProgress | null>(null)
  const [metricsComparison, setMetricsComparison] =
    useState<MetricsComparison | null>(null)
  const [targetData, setTargetData] = useState<TargetData | null>(null)

  const getTargetSlug = () => window.location.pathname.split('/').at(-1) || ''

  // Fetch completion progress and metrics comparison when monthIndex, monthlyAssesments, or dailyAssesments change
  useEffect(() => {
    const fetchData = async () => {
      if (!monthlyAssesments) return

      try {
        // Fetch target data
        const target = await actions.target.getBySlug.orThrow({
          slug: getTargetSlug()
        })
        setTargetData(target)

        // Fetch completion progress
        const progress = await actions.assesment.monthly.getProgress.orThrow({
          targetSlug: getTargetSlug(),
          monthIndex: currentMonthIndex
        })
        setCompletionProgress(progress)

        // Fetch metrics comparison
        const comparison =
          await actions.assesment.monthly.getMetricsComparison.orThrow({
            targetSlug: getTargetSlug(),
            monthIndex: currentMonthIndex
          })
        setMetricsComparison(comparison)
      } catch (error) {
        console.error('Error fetching data:', error)
        setCompletionProgress(null)
        setMetricsComparison(null)
        setTargetData(null)
      }
    }

    fetchData()
  }, [currentMonthIndex, monthlyAssesments, dailyAssesments])

  const handleUpdate = async (_prev: unknown, formData: FormData) => {
    const { error } = await actions.assesment.monthly.set(formData)
    if (error) {
      showErrorToast('Terjadi kesalahan saat menyimpan data asesmen bulanan.')
      return undefined
    }

    const state = await actions.assesment.monthly.get.orThrow({
      targetSlug: getTargetSlug(),
      monthIndex: currentMonthIndex
    })
    setMonthlyAssesment(state)
    showSuccessToast('Data asesmen bulanan berhasil disimpan!')
    return undefined
  }

  const [_, action, isPending] = useActionState(handleUpdate, undefined)

  const handleSave = () => {
    if (!formRef.current || isPending || !monthlyAssesments) return
    const form = formRef.current
    // Only submit if something changed
    const changed =
      parseFloat(form.height.value) !== Number(monthlyAssesments.height) ||
      parseFloat(form.weight.value) !== Number(monthlyAssesments.weight)
    if (!changed) return
    form.requestSubmit()
  }

  if (!monthlyAssesments) {
    return <></>
  }

  return (
    <form
      className='grid w-full grid-cols-2 gap-3 lg:grid-cols-3'
      action={action}
      ref={formRef}
      onBlur={handleSave}
      key={`form-${monthlyAssesments.monthlyAssesmentId}`}
    >
      {/* Height Card */}
      <div className='card bg-primary/5 border-primary/20 border shadow-sm transition-shadow hover:shadow-md'>
        <div className='card-body flex min-h-[120px] flex-col items-center justify-between p-4 text-center'>
          <div className='text-base-content/70 flex items-center gap-2 text-xs font-medium'>
            <svg
              className='text-primary h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 3v18M19 3v18M8 12h8'
              />
            </svg>
            <label htmlFor='height'>Tinggi Badan</label>
          </div>
          <div className='flex flex-1 items-center justify-center'>
            <div className='text-center'>
              <input
                className='text-primary focus:ring-primary/20 w-36 rounded bg-transparent px-2 text-center text-3xl font-bold transition-all duration-200 focus:ring-2 focus:outline-none'
                name='height'
                id='height'
                type='number'
                step={0.1}
                min={0}
                disabled={isPending}
                defaultValue={monthlyAssesments.height}
              />
              <span className='text-primary ml-1 text-xl font-bold'>cm</span>
            </div>
          </div>
          <div className='text-base-content/50 w-full truncate text-xs'>
            {metricsComparison ? (
              <span
                className={clsx(
                  metricsComparison.deltas.height === 0
                    ? 'text-base-content/50'
                    : metricsComparison.deltas.height > 0
                      ? 'text-success'
                      : 'text-warning'
                )}
              >
                {metricsComparison.deltas.height === 0
                  ? 'Tidak berubah'
                  : `${metricsComparison.deltas.height > 0 ? '+' : ''}${metricsComparison.deltas.height.toFixed(1)} cm`}
              </span>
            ) : (
              'Masukkan tinggi badan'
            )}
          </div>
        </div>
      </div>

      {/* Weight Card */}
      <div className='card bg-warning/5 border-warning/20 border shadow-sm transition-shadow hover:shadow-md'>
        <div className='card-body flex min-h-[120px] flex-col items-center justify-between p-4 text-center'>
          <div className='text-base-content/70 flex items-center gap-2 text-xs font-medium'>
            <svg
              className='text-warning h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3'
              />
            </svg>
            <label htmlFor='weight'>Berat Badan</label>
          </div>
          <div className='flex flex-1 items-center justify-center'>
            <div className='text-center'>
              <input
                className='text-warning focus:ring-warning/20 w-36 rounded bg-transparent px-2 text-center text-3xl font-bold transition-all duration-200 focus:ring-2 focus:outline-none'
                name='weight'
                id='weight'
                type='number'
                step={0.01}
                min={0}
                disabled={isPending}
                defaultValue={monthlyAssesments.weight}
              />
              <span className='text-warning ml-1 text-xl font-bold'>kg</span>
            </div>
          </div>
          <div className='text-base-content/50 w-full truncate text-xs'>
            {metricsComparison ? (
              <span
                className={clsx(
                  metricsComparison.deltas.weight === 0
                    ? 'text-base-content/50'
                    : metricsComparison.deltas.weight > 0
                      ? 'text-warning'
                      : 'text-success'
                )}
              >
                {metricsComparison.deltas.weight === 0
                  ? 'Tidak berubah'
                  : `${metricsComparison.deltas.weight > 0 ? '+' : ''}${metricsComparison.deltas.weight.toFixed(2)} kg`}
              </span>
            ) : (
              'Masukkan berat badan'
            )}
          </div>
        </div>
      </div>

      {/* BMI Card */}
      <div className='card bg-info/5 border-info/20 border shadow-sm transition-shadow hover:shadow-md'>
        <div className='card-body flex min-h-[120px] flex-col items-center justify-between p-4 text-center'>
          <div className='text-base-content/70 flex items-center gap-2 text-xs font-medium'>
            <svg
              className='text-info h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
              />
            </svg>
            IMT
          </div>
          <div className='flex flex-1 items-center justify-center'>
            <div
              className={clsx(
                'text-3xl font-bold',
                getBMIClassification(Number(monthlyAssesments.bmi)).color
              )}
            >
              {monthlyAssesments.bmi}
            </div>
          </div>
          <div className='text-base-content/50 w-full truncate text-xs'>
            {getBMIClassification(Number(monthlyAssesments.bmi)).category}
          </div>
        </div>
      </div>

      {/* Age Card */}
      <div className='card bg-base-200/30 border-base-300 border shadow-sm transition-shadow hover:shadow-md'>
        <div className='card-body flex min-h-[120px] flex-col items-center justify-between p-4 text-center'>
          <div className='text-base-content/70 flex items-center gap-2 text-xs font-medium'>
            <svg
              className='text-base-content/60 h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            Usia
          </div>
          <div className='flex flex-1 items-center justify-center'>
            <div className='text-base-content text-3xl font-bold'>
              {targetData && targetData.birthDate
                ? formatAge(
                    calculateAgeAtMonth(targetData.birthDate, currentMonthIndex)
                  )
                : '-'}
            </div>
          </div>
          <div className='text-base-content/50 w-full truncate text-xs'>
            {targetData && targetData.birthDate
              ? (() => {
                  const ageAtMonth = calculateAgeAtMonth(
                    targetData.birthDate,
                    currentMonthIndex
                  )
                  return ageAtMonth < 24
                    ? 'bulan'
                    : (() => {
                        const remainingMonths = ageAtMonth % 12
                        return remainingMonths === 0
                          ? 'tahun'
                          : `${Math.floor(ageAtMonth / 12)} thn ${remainingMonths} bln`
                      })()
                })()
              : 'Usia pada bulan tersebut'}
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className='card bg-info/5 border-info/20 border shadow-sm transition-shadow hover:shadow-md'>
        <div className='card-body flex min-h-[120px] flex-col items-center justify-between p-4 text-center'>
          <div className='text-base-content/70 flex items-center gap-2 text-xs font-medium'>
            <svg
              className='text-info h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            Progress
          </div>
          <div className='flex flex-1 items-center justify-center'>
            <div className='text-info text-3xl font-bold'>
              {completionProgress
                ? `${Math.round(completionProgress.percentage)}%`
                : '0%'}
            </div>
          </div>
          <div className='text-base-content/50 w-full truncate text-xs'>
            {completionProgress
              ? `${completionProgress.completed}/${completionProgress.total} hari`
              : 'Belum ada data'}
          </div>
        </div>
      </div>

      {/* Score Card */}
      <div className='card bg-accent/5 border-accent/20 border shadow-sm transition-shadow hover:shadow-md'>
        <div className='card-body flex min-h-[120px] flex-col items-center justify-between p-4 text-center'>
          <div className='text-base-content/70 flex items-center gap-2 text-xs font-medium'>
            <svg
              className='text-accent h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
              />
            </svg>
            Skor
          </div>
          <div className='flex flex-1 items-center justify-center'>
            <div className='text-accent text-3xl font-bold'>
              {metricsComparison ? metricsComparison.currentScore : '0'}
            </div>
          </div>
          <div className='text-base-content/50 w-full truncate text-xs'>
            {metricsComparison && completionProgress ? (
              <span
                className={clsx(
                  getScoreClassification(
                    metricsComparison.currentScore,
                    completionProgress.percentage
                  ).color
                )}
              >
                {
                  getScoreClassification(
                    metricsComparison.currentScore,
                    completionProgress.percentage
                  ).category
                }
              </span>
            ) : (
              'Belum ada skor'
            )}
          </div>
        </div>
      </div>

      {/* hidden */}
      <input type='hidden' name='targetId' value={monthlyAssesments.targetId} />
      <input
        type='hidden'
        name='monthlyAssesmentId'
        value={monthlyAssesments.monthlyAssesmentId}
      />
    </form>
  )
}

export default AssesmentStatRC
