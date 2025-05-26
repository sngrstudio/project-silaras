import { type FC } from 'react'
import { useStore } from '@nanostores/react'
import { $currentMonthIndex, setCurrentMonthIndex } from './assesment.store'
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

  const handlePrevPage = async () => {
    setCurrentMonthIndex(currentMonthIndex - 1)
  }

  const handleNextPage = async () => {
    setCurrentMonthIndex(currentMonthIndex + 1)
  }

  return (
    <div className='card-actions mt-8'>
      <div className='join w-full'>
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
    </div>
  )
}

export default Navigation
