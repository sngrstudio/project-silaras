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
  current: any
  previous: any
  initial: any
  deltas: {
    weight: number
    height: number
    bmi: number
    score: number
  }
  isFirstMonth: boolean
  currentScore: number
  previousScore: number | null
}

interface TargetData {
  id: string
  name: string
  age: number | null // age in months
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

// Delta indicator component
const DeltaIndicator: FC<{
  delta: number
  unit: string
  type: 'weight' | 'height' | 'bmi'
}> = ({ delta, unit, type }) => {
  const isPositive = delta > 0
  const isZero = delta === 0

  const getColorClass = () => {
    if (isZero) return 'text-base-content'

    if (type === 'height') {
      return isPositive ? 'text-success' : 'text-warning' // Height increase is good
    }

    if (type === 'weight') {
      return isPositive ? 'text-warning' : 'text-success' // Weight loss might be good depending on context
    }

    // type === 'bmi'
    return isPositive ? 'text-warning' : 'text-success' // BMI decrease is generally good
  }

  return (
    <div className={clsx('stat-desc flex items-center gap-1', getColorClass())}>
      <span className='text-xs'>{isZero ? '●' : isPositive ? '▲' : '▼'}</span>
      <span className='text-xs'>
        {isZero
          ? 'Tidak berubah'
          : `${isPositive ? '+' : ''}${delta.toFixed(type === 'height' ? 1 : 2)} ${unit}`}
      </span>
    </div>
  )
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
      className='stats max-md:stats-vertical border-base-300 w-full border'
      action={action}
      ref={formRef}
      onBlur={handleSave}
      key={`form-${monthlyAssesments.monthlyAssesmentId}`}
    >
      <div className='stat place-items-center'>
        <label className='stat-title' htmlFor='height'>
          Tinggi Badan (cm)
        </label>
        <input
          className='stat-value w-[124px] text-center'
          name='height'
          id='height'
          type='number'
          step={0.1}
          min={0}
          disabled={isPending}
          defaultValue={monthlyAssesments.height}
        />
        {metricsComparison && (
          <DeltaIndicator
            delta={metricsComparison.deltas.height}
            unit='cm'
            type='height'
          />
        )}
      </div>

      <div className='stat place-items-center'>
        <span className='stat-title'>Usia</span>
        <span className='stat-value'>
          {targetData ? formatAge(targetData.age) : '-'}
        </span>
        <div className='stat-desc'>
          {targetData && targetData.age
            ? targetData.age < 24
              ? 'bulan'
              : (() => {
                  const remainingMonths = targetData.age % 12
                  return remainingMonths === 0
                    ? 'tahun'
                    : `tahun ${remainingMonths} bulan`
                })()
            : 'Usia saat ini'}
        </div>
      </div>

      <div className='stat place-items-center'>
        <label className='stat-title' htmlFor='weight'>
          Berat Badan (kg)
        </label>
        <input
          className='stat-value w-[124px] text-center'
          name='weight'
          id='weight'
          type='number'
          step={0.01}
          min={0}
          disabled={isPending}
          defaultValue={monthlyAssesments.weight}
        />
        {metricsComparison && (
          <DeltaIndicator
            delta={metricsComparison.deltas.weight}
            unit='kg'
            type='weight'
          />
        )}
      </div>

      <div className='stat place-items-center'>
        <span className='stat-title'>Indeks Massa Tubuh</span>
        <span
          className={clsx(
            'stat-value',
            getBMIClassification(Number(monthlyAssesments.bmi)).color
          )}
        >
          {monthlyAssesments.bmi}
        </span>
        <div className='stat-desc flex items-center gap-2'>
          <span>
            {getBMIClassification(Number(monthlyAssesments.bmi)).category}
          </span>
          {metricsComparison && (
            <span
              className={clsx('flex items-center gap-1', {
                'text-base-content': metricsComparison.deltas.bmi === 0,
                'text-warning': metricsComparison.deltas.bmi > 0,
                'text-success': metricsComparison.deltas.bmi < 0
              })}
            >
              <span className='text-xs'>
                {metricsComparison.deltas.bmi === 0
                  ? '●'
                  : metricsComparison.deltas.bmi > 0
                    ? '▲'
                    : '▼'}
              </span>
              <span className='text-xs'>
                {metricsComparison.deltas.bmi === 0
                  ? 'Tidak berubah'
                  : `${metricsComparison.deltas.bmi > 0 ? '+' : ''}${metricsComparison.deltas.bmi.toFixed(2)}`}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className='stat place-items-center'>
        <span className='stat-title'>Progress Bulan Ini</span>
        <span className='stat-value'>
          {completionProgress ? `${completionProgress.percentage}%` : '0%'}
        </span>
        <div className='stat-figure'>
          {completionProgress ? (
            <div
              className='radial-progress text-success'
              style={
                {
                  '--value': completionProgress.percentage,
                  '--size': '4rem',
                  '--thickness': '4px'
                } as React.CSSProperties
              }
              role='progressbar'
              aria-valuenow={completionProgress.percentage}
            >
              {completionProgress.percentage}%
            </div>
          ) : (
            <div
              className='radial-progress'
              style={
                {
                  '--value': 0,
                  '--size': '4rem',
                  '--thickness': '4px'
                } as React.CSSProperties
              }
              role='progressbar'
              aria-valuenow={0}
            >
              0%
            </div>
          )}
        </div>
        {completionProgress && (
          <div className='stat-desc'>
            {completionProgress.completed} dari {completionProgress.total} hari
          </div>
        )}
      </div>

      <div className='stat place-items-center'>
        <span className='stat-title'>Skor Bulan Ini</span>
        <span className='stat-value'>
          {metricsComparison ? metricsComparison.currentScore : '0'}
        </span>
        <div className='stat-desc flex flex-col items-center gap-1'>
          {metricsComparison && completionProgress ? (
            <>
              <span
                className={clsx(
                  'text-sm font-medium',
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
              {!metricsComparison.isFirstMonth &&
                completionProgress.percentage >= 75 && (
                  <div className='flex items-center gap-1'>
                    <span
                      className={clsx('text-xs', {
                        'text-base-content':
                          metricsComparison.deltas.score === 0,
                        'text-success': metricsComparison.deltas.score > 0,
                        'text-warning': metricsComparison.deltas.score < 0
                      })}
                    >
                      {metricsComparison.deltas.score === 0
                        ? '●'
                        : metricsComparison.deltas.score > 0
                          ? '▲'
                          : '▼'}
                    </span>
                    <span
                      className={clsx('text-xs', {
                        'text-base-content':
                          metricsComparison.deltas.score === 0,
                        'text-success': metricsComparison.deltas.score > 0,
                        'text-warning': metricsComparison.deltas.score < 0
                      })}
                    >
                      {metricsComparison.deltas.score === 0
                        ? 'Tidak berubah'
                        : `${metricsComparison.deltas.score > 0 ? '+' : ''}${metricsComparison.deltas.score}`}
                    </span>
                  </div>
                )}
            </>
          ) : (
            <span className='text-base-content text-sm'>-</span>
          )}
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
