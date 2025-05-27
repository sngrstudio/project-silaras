import { type FC } from 'react'
import AssesmentForm from './assesment-form'
import { type CellContext } from '@tanstack/react-table'
import { type DailyAssesments } from './assesment.store'

interface MobileListProps {
  cell: CellContext<DailyAssesments[number], unknown>
}

const MobileList: FC<MobileListProps> = ({ cell }) => {
  return (
    <>
      <div className='list-col-grow flex flex-col justify-start gap-y-1'>
        <div className='mb-2 text-lg font-bold'>
          {cell.row.original.date?.toLocaleDateString('id-ID', {
            dateStyle: 'full'
          })}
        </div>
        <div className='badge badge-soft badge-sm badge-primary rounded-full'>
          {cell.row.original.menu1}
        </div>
        <div className='badge badge-soft badge-sm badge-accent rounded-full'>
          {cell.row.original.menu2}
        </div>
      </div>

      <div className='list-col-wrap'>
        <AssesmentForm cell={cell} />
      </div>

      <div>
        <div className='stats'>
          <div className='stat'>
            <div className='stat-value'>{cell.row.original.score}</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileList
