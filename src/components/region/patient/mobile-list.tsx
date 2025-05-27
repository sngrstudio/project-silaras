import { type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { setCurrentPatient, type Patients } from './patient.store'
import EditIcon from '~icons/lucide/pen'
import LinkIcon from '~icons/lucide/external-link'

interface MobileListProps {
  cell: CellContext<Patients[number], unknown>
}

const MobileList: FC<MobileListProps> = ({ cell }) => {
  const name = cell.row.original.name
  const path = `/patient/${cell.row.original.slug}`

  const handleEditBtn = () => {
    setCurrentPatient(cell.row.original)
  }

  return (
    <>
      <div className='list-col-grow flex flex-col justify-center'>
        <a className='link text-lg font-bold' href={path}>
          {name}
        </a>
      </div>
      <div className='list-col-wrap'>
        <span className='badge badge-soft badge-primary badge-sm'>
          {cell.row.original.status}
        </span>
      </div>
      <button
        className='btn btn-ghost btn-square btn-sm'
        onClick={handleEditBtn}
      >
        <EditIcon />
      </button>
      <a
        className='btn btn-ghost btn-square btn-sm'
        href={path}
        aria-label={`buka halaman ${name}`}
      >
        <LinkIcon />
      </a>
    </>
  )
}

export default MobileList
