import { type FC } from 'react'
import type { CellContext } from '@tanstack/react-table'
import type { User } from './users.store'
import { setCurrentUser, setUsers, $currentPage } from './users.store'
import { actions } from 'astro:actions'
import EditIcon from '~icons/lucide/pen'
import TrashIcon from '~icons/lucide/trash-2'
import WhatsAppIcon from '~icons/simple-icons/whatsapp'
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
    <div className='avatar avatar-placeholder'>
      {profilePhoto ? (
        <div className='mask w-10 mask-circle'>
          <Image
            publicId={profilePhoto}
            width={40}
            height={40}
            sizes='40px'
            breakpoints={[32, 40, 64]}
            alt={fullName}
          />
        </div>
      ) : (
        <div className='bg-primary text-primary-content w-10 rounded-full'>
          <span>{fullName.charAt(0).toUpperCase()}</span>
        </div>
      )}
    </div>
  )
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
    <>
      <div className='list-col-grow flex flex-1 flex-col gap-y-1'>
        <div className='mb-2 flex items-center gap-3'>
          <UserAvatar
            profilePhoto={user.profilePhoto}
            fullName={user.fullName}
          />
          <div>
            <div className='font-bold'>{user.fullName}</div>
            <div className='text-sm opacity-75'>@{user.username}</div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span className='badge badge-soft badge-primary badge-xs line-clamp-1'>
            {getAccessLevelName(user.accessLevel)}
          </span>
          {user.regionName && (
            <span className='text-xs text-gray-500'>
              {user.regionName} ({user.regionType?.toLowerCase()})
            </span>
          )}
        </div>
        {user.phoneNumber && (
          <div className='mt-2 flex gap-x-1'>
            <a
              className='btn btn-soft btn-neutral btn-xs'
              href={`https://wa.me/${user.phoneNumber.replace(/^08/, '628')}`}
              target='_blank'
            >
              <WhatsAppIcon />
              <span>WhatsApp</span>
            </a>
          </div>
        )}
      </div>
      <div className='flex flex-col gap-1'>
        {canEdit ? (
          <button
            className='btn btn-ghost btn-square btn-sm'
            onClick={handleEditBtn}
            aria-label={`Edit ${user.fullName}`}
          >
            <EditIcon />
          </button>
        ) : (
          // Show disabled button for fellow admins (Admin viewing other Admin)
          currentUser?.accessLevel === 4 &&
          user.accessLevel === 4 && (
            <button
              className='btn btn-ghost btn-square btn-sm cursor-not-allowed opacity-50'
              disabled
              title='Tidak dapat mengedit sesama administrator'
              aria-label={`Cannot edit fellow admin: ${user.fullName}`}
            >
              <EditIcon />
            </button>
          )
        )}
        {canDelete ? (
          isSelf ? (
            <button
              className='btn btn-ghost btn-square btn-sm text-error cursor-not-allowed opacity-50'
              disabled
              title='Anda tidak dapat menghapus akun Anda sendiri'
              aria-label={`Cannot delete own account: ${user.fullName}`}
            >
              <TrashIcon />
            </button>
          ) : (
            <button
              className='btn btn-ghost btn-square btn-sm text-error'
              onClick={handleDeleteBtn}
              aria-label={`Delete ${user.fullName}`}
            >
              <TrashIcon />
            </button>
          )
        ) : (
          // Show disabled delete button for fellow admins (Admin viewing other Admin)
          currentUser?.accessLevel === 4 &&
          user.accessLevel === 4 && (
            <button
              className='btn btn-ghost btn-square btn-sm text-error cursor-not-allowed opacity-50'
              disabled
              title='Tidak dapat menghapus sesama administrator'
              aria-label={`Cannot delete fellow admin: ${user.fullName}`}
            >
              <TrashIcon />
            </button>
          )
        )}
      </div>
    </>
  )
}

export default MobileList
