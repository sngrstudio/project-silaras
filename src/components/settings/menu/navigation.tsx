import { useEffect, type FC } from 'react'
import { useStore } from '@nanostores/react'
import {
  $currentMonthIndex,
  setCurrentMonthIndex,
  setDailyAssesmentsSettings
} from './menu.store'
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

  useEffect(() => {
    actions.assesment.settings.getAllDaily
      .orThrow({
        monthIndex: currentMonthIndex
      })
      .then((state) => {
        setDailyAssesmentsSettings(state)
      })
  }, [currentMonthIndex])

  const handlePrevPage = async () => {
    setCurrentMonthIndex(currentMonthIndex - 1)
  }

  const handleNextPage = async () => {
    setCurrentMonthIndex(currentMonthIndex + 1)
  }

  return (
    <div className='border-base-300 bg-base-100 inline-flex items-center overflow-hidden rounded-full border shadow-lg'>
      <button
        className='hover:bg-primary hover:text-primary-content disabled:hover:text-base-content flex h-12 items-center justify-center px-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
        aria-label='bulan sebelumnya'
        onClick={handlePrevPage}
        disabled={currentMonthIndex <= 6}
      >
        <PreviousIcon className='h-5 w-5' />
      </button>

      <div className='border-base-300 from-primary/5 to-primary/10 text-base-content flex h-12 items-center border-x bg-gradient-to-r px-6 font-medium'>
        {`Bulan ${MONTHS[currentMonthIndex - 1]}`}
      </div>

      <button
        className='hover:bg-primary hover:text-primary-content disabled:hover:text-base-content flex h-12 items-center justify-center px-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
        aria-label='bulan selanjutnya'
        onClick={handleNextPage}
        disabled={currentMonthIndex >= 10}
      >
        <NextIcon className='h-5 w-5' />
      </button>
    </div>
  )
}

export default Navigation
