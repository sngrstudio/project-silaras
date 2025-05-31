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

// Helper function to copy text to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here if available
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const MobileList: FC<MobileListProps> = ({ cell }) => {
  const name = cell.row.original.name
  const path = `/patient/${cell.row.original.slug}`

  const handleEditBtn = () => {
    setCurrentPatient(cell.row.original)
  }

  const handleCopyPhone = () => {
    if (cell.row.original.phoneNumber) {
      copyToClipboard(cell.row.original.phoneNumber)
    }
  }

  return (
    <>
      <div className='list-col-grow flex flex-col gap-y-2'>
        {/* Patient name and basic info */}
        <div>
          <a className='link text-base font-bold' href={path}>
            {name}
          </a>
          <div className='mt-1 flex items-center gap-2'>
            <span className='badge badge-soft badge-primary badge-xs'>
              {cell.row.original.status}
            </span>
            {cell.row.original.age && (
              <span className='text-base-content/70 text-xs'>
                {cell.row.original.age <= 24
                  ? `${cell.row.original.age} bulan`
                  : `${Math.floor(cell.row.original.age / 12)} tahun ${cell.row.original.age % 12} bulan`}
              </span>
            )}
          </div>
        </div>

        {/* Phone number section */}
        {cell.row.original.phoneNumber && (
          <div className='flex items-center gap-2'>
            <button
              onClick={handleCopyPhone}
              className='text-base-content/70 hover:text-primary cursor-pointer text-sm'
              title='Klik untuk menyalin nomor telepon'
            >
              {cell.row.original.phoneNumber}
            </button>
            <a
              className='btn btn-ghost btn-xs'
              href={`https://wa.me/${cell.row.original.phoneNumber?.replace(/^08/, '628')}`}
              target='_blank'
              aria-label='WhatsApp'
            >
              <WhatsAppIcon />
            </a>
          </div>
        )}
      </div>

      <div className='list-col-fixed flex flex-col gap-1'>
        <button
          className='btn btn-soft btn-primary btn-xs'
          onClick={handleEditBtn}
        >
          <EditIcon />
          <span>Edit</span>
        </button>

        <a
          className='btn btn-soft btn-neutral btn-xs'
          href={`https://www.google.com/maps/search/?api=1&query=${cell.row.original.latitude},${cell.row.original.longitude}`}
          target='_blank'
        >
          <GMapsIcon />
          <span>Lokasi</span>
        </a>
      </div>
    </>
  )
}

export default MobileList
