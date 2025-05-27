import { useEffect, type FC } from 'react'
import { useStore } from '@nanostores/react'
import {
  $currentMonthIndex,
  setCurrentMonthIndex,
  setDailyAssesments
} from './assesment.store'
import { actions } from 'astro:actions'
import PreviousIcon from '~icons/lucide/chevron-left'
import NextIcon from '~icons/lucide/chevron-right'

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
] as const

const Navigation: FC = () => {
  const currentMonthIndex = useStore($currentMonthIndex)

  const getPatientSlug = () => window.location.pathname.split('/').at(-1) || ''

  useEffect(() => {
    actions.assesment.daily.getAll
      .orThrow({
        patientSlug: getPatientSlug(),
        monthIndex: currentMonthIndex
      })
      .then((state) => {
        setDailyAssesments(state)
      })
  }, [currentMonthIndex])

  const handlePrevPage = async () => {
    setCurrentMonthIndex(currentMonthIndex - 1)
  }

  const handleNextPage = async () => {
    setCurrentMonthIndex(currentMonthIndex + 1)
  }

  return (
    <div className='join max-md:w-full'>
      <button
        className='btn'
        aria-label='bulan sebelumnya'
        onClick={handlePrevPage}
        disabled={currentMonthIndex <= 6}
      >
        <PreviousIcon />
      </button>
      <div className='btn max-md:flex-1'>
        {`Bulan ${MONTHS[currentMonthIndex - 1]}`}
      </div>
      <button
        className='btn'
        aria-label='bulan selanjutnya'
        onClick={handleNextPage}
        disabled={currentMonthIndex >= 10}
      >
        <NextIcon />
      </button>
    </div>
  )
}

export default Navigation
