import { type FC } from 'react'
import clsx from 'clsx'
import { type CellContext } from '@tanstack/react-table'
import { setCurrentTarget, type Targets, $currentRegion } from './target.store'
import EditIcon from '~icons/lucide/pen'
import WhatsAppIcon from '~icons/simple-icons/whatsapp'
import IconUser from '~icons/lucide/user'
import IconPhone from '~icons/lucide/phone'
import IconClock from '~icons/lucide/clock'
import IconMapPin from '~icons/lucide/map-pin'
import { canUserAccessTargetSync } from '../../../utils/access-control'
import {
  showSuccessToast,
  showErrorToast
} from '~/components/common/toast/toast.store'
import { useStore } from '@nanostores/react'

// Helper function to get display name for status
const getStatusDisplayName = (status: string) => {
  switch (status) {
    case 'HAMIL':
      return 'Hamil'
    case 'MENYUSUI':
      return 'Menyusui'
    case 'ANAK-ANAK':
      return 'Baduta'
    default:
      return status
  }
}

interface MobileListProps {
  cell: CellContext<Targets[number], unknown>
  currentUser: any
  userRegion: any
  loading: boolean
}

// Helper function to copy text to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showSuccessToast('Nomor telepon berhasil disalin!')
  } catch (err) {
    showErrorToast('Gagal menyalin nomor telepon.')
  }
}

const MobileList: FC<MobileListProps> = ({
  cell,
  currentUser,
  userRegion,
  loading
}) => {
  const target = cell.row.original
  const currentRegion = useStore($currentRegion)
  const name = target.name
  const path = `/target/${target.slug}`

  // Check if user can access this target
  // Use currentRegion as the target's region since all targets on this page belong to the current region
  const canAccess =
    !loading &&
    currentRegion &&
    userRegion &&
    canUserAccessTargetSync(currentUser, currentRegion, userRegion)

  const handleEditBtn = () => {
    setCurrentTarget(cell.row.original)
  }

  const handleCopyPhone = () => {
    if (cell.row.original.phoneNumber) {
      copyToClipboard(cell.row.original.phoneNumber)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Header Section */}
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='mb-2 flex items-center gap-2'>
            <IconUser className='text-primary h-4 w-4' />
            {canAccess ? (
              <a
                className='link link-primary hover:text-primary/80 text-lg font-bold transition-colors duration-200'
                href={path}
              >
                {name}
              </a>
            ) : (
              <span
                className='text-base-content/50 cursor-not-allowed text-lg font-bold'
                title='Anda tidak memiliki akses ke sasaran ini'
              >
                {name}
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className='mb-3 flex items-center gap-2'>
            <span
              className={clsx(
                'badge badge-sm rounded-full px-3 py-1 font-medium',
                {
                  'badge-primary bg-primary/20 text-primary border-primary/30':
                    target.status === 'HAMIL',
                  'badge-accent bg-accent/20 text-accent border-accent/30':
                    target.status === 'MENYUSUI',
                  'badge-success bg-success/20 text-success border-success/30':
                    target.status === 'ANAK-ANAK'
                }
              )}
            >
              {getStatusDisplayName(target.status)}
            </span>
            {target.age && (
              <span className='text-base-content/60 flex items-center gap-1 text-sm'>
                <IconClock className='h-3 w-3' />
                {target.age <= 24
                  ? `${target.age} bulan`
                  : `${Math.floor(target.age / 12)} tahun ${target.age % 12} bulan`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      {target.phoneNumber && (
        <div className='bg-success/5 border-success/20 rounded-lg border p-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <IconPhone className='text-success h-4 w-4' />
              <button
                onClick={handleCopyPhone}
                className='text-success hover:text-success/80 cursor-pointer font-medium transition-colors duration-200'
                title='Klik untuk menyalin nomor telepon'
              >
                {target.phoneNumber}
              </button>
            </div>
            <a
              className='btn btn-ghost btn-sm text-success hover:bg-success/10 transition-colors duration-200'
              href={`https://wa.me/${target.phoneNumber?.replace(/^08/, '628')}`}
              target='_blank'
              aria-label='WhatsApp'
            >
              <WhatsAppIcon className='h-4 w-4' />
            </a>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className='border-base-300/30 flex gap-2 border-t pt-2'>
        <button
          className={clsx(
            'btn btn-sm flex-1 transition-all duration-200 hover:scale-105',
            {
              'btn-primary hover:shadow-md': canAccess,
              'btn-disabled cursor-not-allowed opacity-50': !canAccess
            }
          )}
          onClick={handleEditBtn}
          disabled={!canAccess}
          title={
            !canAccess
              ? 'Anda tidak memiliki akses ke sasaran ini'
              : 'Edit sasaran'
          }
        >
          <EditIcon className='h-4 w-4' />
          <span>Edit</span>
        </button>

        <a
          className='btn btn-neutral btn-sm flex-1 transition-all duration-200 hover:scale-105 hover:shadow-md'
          href={`https://www.google.com/maps/search/?api=1&query=${target.latitude},${target.longitude}`}
          target='_blank'
        >
          <IconMapPin className='h-4 w-4' />
          <span>Lokasi</span>
        </a>
      </div>
    </div>
  )
}

export default MobileList
