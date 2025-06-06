/**
 * @fileoverview Mobile List Component for User Management
 *
 * This component provides a mobile-optimized list view for displaying user data
 * within the SILARAS platform. It renders user information in a card-based layout
 * suitable for mobile devices with comprehensive user details and actions.
 *
 * Key Features:
 * - Mobile-optimized card layout for user profiles
 * - Role-based access control for user actions
 * - Interactive user editing and management
 * - User contact information with WhatsApp integration
 * - Role and permission management interface
 * - Real-time user data synchronization
 *
 * User Information Display:
 * - User full name and username
 * - Role badges with visual indicators
 * - Contact information with click-to-call/WhatsApp
 * - Region assignment and management
 * - Identity card number (NIK) display
 *
 * Interactive Features:
 * - Edit user functionality with permission checks
 * - Delete user with confirmation dialogs
 * - Role management and assignment
 * - Region association management
 * - Quick contact actions (phone, WhatsApp)
 *
 * Security Features:
 * - Role-based action visibility
 * - Permission checks for sensitive operations
 * - Secure user data handling
 *
 * @module Components/Settings/Users
 * @author SNGR Creative
 * @since 1.0.0
 */
// filepath: /workspaces/project-dashat/src/components/settings/users/mobile-list.tsx

import { type FC } from 'react'
import clsx from 'clsx'
import type { CellContext } from '@tanstack/react-table'
import type { User } from './users.store'
import { setCurrentUser, setUsers, $currentPage } from './users.store'
import { actions } from 'astro:actions'
import EditIcon from '~icons/lucide/pen'
import TrashIcon from '~icons/lucide/trash-2'
import WhatsAppIcon from '~icons/simple-icons/whatsapp'
import KeyIcon from '~icons/lucide/key'
import MapPinIcon from '~icons/lucide/map-pin'
import PhoneIcon from '~icons/lucide/phone'
import Image from '~/components/common/image/image'
import {
  canUserEditUser,
  canUserDeleteUser,
  getAccessLevelName
} from '~/utils/access-control'
import { useUserRegion } from '~/utils/hooks/useUserRegion'
import {
  showSuccessToast,
  showErrorToast
} from '~/components/common/toast/toast.store'

type CurrentUser = Awaited<ReturnType<typeof actions.user.getCurrent.orThrow>>

// Avatar component for mobile list
const UserAvatar: FC<{
  profilePhoto: string | null | undefined
  fullName: string
}> = ({ profilePhoto, fullName }) => {
  return (
    <div className={clsx('avatar', !profilePhoto && 'avatar-placeholder')}>
      {profilePhoto ? (
        <div className='mask ring-primary/20 ring-offset-base-100 h-12 w-12 mask-circle ring-2 ring-offset-2'>
          <Image
            className='object-cover'
            publicId={profilePhoto}
            width={48}
            height={48}
            sizes='48px'
            breakpoints={[32, 40, 48, 64, 80]}
            alt={fullName}
          />
        </div>
      ) : (
        <div className='from-primary to-primary/80 text-primary-content ring-primary/20 ring-offset-base-100 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br font-bold ring-2 ring-offset-2 transition-all duration-300 hover:scale-105'>
          <span className='text-sm'>{fullName.charAt(0).toUpperCase()}</span>
        </div>
      )}
    </div>
  )
}

// Helper function to get access level color
const getAccessLevelColor = (accessLevel: number) => {
  switch (accessLevel) {
    case 1:
      return 'text-gray-600'
    case 2:
      return 'text-blue-600'
    case 3:
      return 'text-green-600'
    case 4:
      return 'text-purple-600'
    default:
      return 'text-gray-600'
  }
}

interface MobileListProps {
  cell: CellContext<User, unknown>
  currentUser: CurrentUser | null
}

const MobileList: FC<MobileListProps> = ({ cell, currentUser }) => {
  const user = cell.row.original
  const { userRegion } = useUserRegion()
  const isSelf = currentUser && currentUser.id === user.id

  // Create target user region object from available data
  const targetUserRegion = user.regionId
    ? {
        id: user.regionId,
        name: user.regionName || '',
        slug: user.regionSlug || '',
        type: user.regionType as 'KABUPATEN' | 'KECAMATAN' | 'DESA',
        parentId: user.regionParentId || null
      }
    : null

  const canEdit = currentUser
    ? canUserEditUser(currentUser, user, userRegion, targetUserRegion)
    : false
  const canDelete = currentUser
    ? canUserDeleteUser(currentUser, user, userRegion, targetUserRegion)
    : false

  const handleEditBtn = () => {
    setCurrentUser(user)
  }

  const handleDeleteBtn = async () => {
    const confirmed = confirm(
      `Apakah Anda yakin ingin menghapus pengguna "${user.fullName}"?`
    )

    if (confirmed) {
      try {
        await actions.user.delete({ id: user.id })

        // Refresh the users list
        const currentPage = $currentPage.get()
        const updatedUsers = await actions.user.getAll.orThrow({
          page: currentPage,
          size: 10
        })
        setUsers(updatedUsers)
        showSuccessToast(`Pengguna "${user.fullName}" berhasil dihapus.`)
      } catch (error: any) {
        // Handle specific error codes with user-friendly messages
        if (error.code === 'FORBIDDEN') {
          if (error.message.includes('akun Anda sendiri')) {
            showErrorToast('Anda tidak dapat menghapus akun Anda sendiri.')
          } else if (error.message.includes('administrator')) {
            showErrorToast('Hanya administrator yang dapat menghapus pengguna.')
          } else {
            showErrorToast(
              'Anda tidak memiliki izin untuk menghapus pengguna ini.'
            )
          }
        } else if (error.code === 'NOT_FOUND') {
          showErrorToast('Pengguna yang akan dihapus tidak ditemukan.')
        } else if (error.code === 'BAD_REQUEST') {
          if (
            error.message.includes('dependensi') ||
            error.message.includes('terkait')
          ) {
            showErrorToast(
              'Pengguna tidak dapat dihapus karena masih memiliki data terkait di sistem.'
            )
          } else {
            showErrorToast('Permintaan penghapusan tidak valid.')
          }
        } else if (error.code === 'INTERNAL_SERVER_ERROR') {
          showErrorToast(
            'Terjadi masalah pada server saat menghapus pengguna. Silakan coba lagi nanti.'
          )
        } else {
          showErrorToast(
            error.message || 'Terjadi kesalahan saat menghapus pengguna.'
          )
        }
      }
    }
  }

  return (
    <div className='border-base-300/50 bg-base-100/50 card border shadow-sm transition-all duration-300 hover:shadow-md'>
      <div className='card-body p-4'>
        {/* User Profile Header */}
        <div className='mb-4 flex items-center gap-4'>
          <UserAvatar
            profilePhoto={user.profilePhoto}
            fullName={user.fullName}
          />
          <div className='flex-1'>
            <h3 className='text-base-content font-bold'>{user.fullName}</h3>
            <p className='text-base-content/60 text-sm'>@{user.username}</p>
          </div>
        </div>

        {/* User Details */}
        <div className='space-y-3'>
          {/* Access Level */}
          <div className='bg-base-100/50 border-base-300/50 flex items-center justify-between rounded-lg border p-3'>
            <div className='flex items-start gap-2'>
              <KeyIcon
                className={clsx(
                  'mt-0.5 h-4 w-4',
                  getAccessLevelColor(user.accessLevel)
                )}
              />
              <span className='text-base-content/70 text-sm font-medium'>
                Level Akses:
              </span>
            </div>
            <div className='text-right'>
              <div
                className={clsx(
                  'text-sm font-bold',
                  getAccessLevelColor(user.accessLevel)
                )}
              >
                {getAccessLevelName(user.accessLevel)}
              </div>
            </div>
          </div>

          {/* Region */}
          <div className='bg-base-100/50 border-base-300/50 flex items-center justify-between rounded-lg border p-3'>
            <div className='flex items-start gap-2'>
              <MapPinIcon
                className={clsx(
                  'mt-0.5 h-4 w-4',
                  user.regionName ? 'text-info' : 'text-gray-400'
                )}
              />
              <span className='text-base-content/70 text-sm font-medium'>
                Wilayah:
              </span>
            </div>
            <div className='text-right'>
              {user.regionName ? (
                <>
                  <div className='text-base-content text-sm font-bold'>
                    {user.regionName}
                  </div>
                  <div className='text-base-content/60 text-xs capitalize'>
                    {user.regionType?.toLowerCase()}
                  </div>
                </>
              ) : (
                <span className='text-base-content/40 text-sm'>
                  Tidak ada wilayah
                </span>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className='bg-base-100/50 border-base-300/50 flex items-center justify-between rounded-lg border p-3'>
            <div className='flex items-start gap-2'>
              <PhoneIcon
                className={clsx(
                  'mt-0.5 h-4 w-4',
                  user.phoneNumber ? 'text-success' : 'text-gray-400'
                )}
              />
              <span className='text-base-content/70 text-sm font-medium'>
                Kontak:
              </span>
            </div>
            <div className='flex items-center gap-2'>
              {user.phoneNumber ? (
                <>
                  <span className='text-base-content text-sm font-bold'>
                    {user.phoneNumber}
                  </span>
                  <a
                    href={`https://wa.me/${user.phoneNumber.replace(/^08/, '628')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white transition-all duration-300 hover:scale-110 hover:bg-green-600'
                    aria-label='WhatsApp'
                  >
                    <WhatsAppIcon className='h-3 w-3' />
                  </a>
                </>
              ) : (
                <span className='text-base-content/40 text-sm'>
                  Tidak ada nomor
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='border-base-300/50 mt-4 flex gap-2 border-t pt-4'>
          {canEdit ? (
            <button
              className='btn btn-sm from-primary to-primary/80 border-primary/30 text-primary-content flex-1 bg-gradient-to-r transition-all duration-300 hover:scale-105'
              onClick={handleEditBtn}
            >
              <EditIcon className='h-4 w-4' />
              <span>Edit</span>
            </button>
          ) : (
            // Show disabled button for fellow admins (Admin viewing other Admin)
            currentUser?.accessLevel === 4 &&
            user.accessLevel === 4 && (
              <button
                className='btn btn-sm flex-1 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60'
                disabled
                title='Tidak dapat mengedit sesama administrator'
              >
                <EditIcon className='h-4 w-4' />
                <span>Edit</span>
              </button>
            )
          )}
          {canDelete ? (
            isSelf ? (
              <button
                className='btn btn-sm flex-1 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60'
                disabled
                title='Anda tidak dapat menghapus akun Anda sendiri'
                aria-label={`Cannot delete own account: ${user.fullName}`}
              >
                <TrashIcon className='h-4 w-4' />
                <span>Hapus</span>
              </button>
            ) : (
              <button
                className='btn btn-sm from-error to-error/80 border-error/30 text-error-content flex-1 bg-gradient-to-r transition-all duration-300 hover:scale-105'
                onClick={handleDeleteBtn}
                aria-label={`Delete ${user.fullName}`}
              >
                <TrashIcon className='h-4 w-4' />
                <span>Hapus</span>
              </button>
            )
          ) : (
            // Show disabled delete button for fellow admins (Admin viewing other Admin)
            currentUser?.accessLevel === 4 &&
            user.accessLevel === 4 && (
              <button
                className='btn btn-sm flex-1 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60'
                disabled
                title='Tidak dapat menghapus sesama administrator'
              >
                <TrashIcon className='h-4 w-4' />
                <span>Hapus</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default MobileList
