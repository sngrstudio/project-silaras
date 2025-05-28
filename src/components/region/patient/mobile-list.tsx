import { type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { setCurrentPatient, type Patients } from './patient.store'
import EditIcon from '~icons/lucide/pen'
import LinkIcon from '~icons/lucide/external-link'
import WhatsAppIcon from '~icons/simple-icons/whatsapp'
import GMapsIcon from '~icons/simple-icons/googlemaps'

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
        <div className='mt-2 flex gap-x-1'>
          <a
            className='btn btn-soft btn-neutral btn-xs'
            href={`https://wa.me/${cell.row.original.phoneNumber?.replace(/^08/, '628')}`}
            target='_blank'
          >
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </a>

          <a
            className='btn btn-soft btn-neutral btn-xs'
            href={`https://www.google.com/maps/search/?api=1&query=${cell.row.original.latitude},${cell.row.original.longitude}`}
            target='_blank'
          >
            <GMapsIcon />
            <span>Lokasi</span>
          </a>
        </div>
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
