import { type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { type DailyAssesmentsSettings } from './menu.store'
import MenuForm from './menu-form'

interface MobileListProps {
  cell: CellContext<DailyAssesmentsSettings[number], unknown>
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

        <MenuForm cell={cell} key={cell.row.original.id} />
      </div>
    </>
  )
}

export default MobileList
