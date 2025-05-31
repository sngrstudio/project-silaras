import { type FC, useState, useEffect } from 'react'
import type { CellContext } from '@tanstack/react-table'
import type { Users } from './users.store'
import { setCurrentUser, setUsers, $currentPage } from './users.store'
import { $currentUser as $globalCurrentUser } from '~/components/layout/drawer/drawer.store'
import { useStore } from '@nanostores/react'
import { actions } from 'astro:actions'
import EditIcon from '~icons/lucide/pen'
import TrashIcon from '~icons/lucide/trash-2'
import WhatsAppIcon from '~icons/simple-icons/whatsapp'
import Image from '~/components/common/image/image'
import type { GetImageResult } from 'astro'

// Cache for profile photo URLs to avoid repeated API calls
const profilePhotoCache = new Map<string, GetImageResult>()

const useProfilePhoto = (fileName: string | null | undefined) => {
  const [profilePhoto, setProfilePhoto] = useState<GetImageResult | undefined>(
    undefined
  )

  useEffect(() => {
    if (!fileName) {
      setProfilePhoto(undefined)
      return
    }

    // Check cache first
    if (profilePhotoCache.has(fileName)) {
      setProfilePhoto(profilePhotoCache.get(fileName))
      return
    }

    // Fetch presigned URL
    actions.image.getPresignedImage
      .orThrow({ fileName, width: 40, height: 40 })
      .then((image) => {
        profilePhotoCache.set(fileName, image)
        setProfilePhoto(image)
      })
      .catch(() => {
        setProfilePhoto(undefined)
      })
  }, [fileName])

  return profilePhoto
}

// Avatar component for mobile list
const UserAvatar: FC<{
  profilePhoto: string | null | undefined
  fullName: string
}> = ({ profilePhoto, fullName }) => {
  const profilePhotoUrl = useProfilePhoto(profilePhoto)

  return (
    <div className='avatar' data-placeholder={!profilePhotoUrl}>
      <div className='w-10 rounded'>
        {profilePhotoUrl ? (
          <Image image={profilePhotoUrl} alt={fullName} />
        ) : (
          <div className='bg-neutral text-neutral-content w-10 rounded-full'>
            <span className='text-sm'>{fullName.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface MobileListProps {
  cell: CellContext<Users[number], unknown>
}

const MobileList: FC<MobileListProps> = ({ cell }) => {
  const user = cell.row.original
  const currentUser = useStore($globalCurrentUser)
  const isSelf = currentUser && currentUser.id === user.id

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
      } catch (error: any) {
        alert(error.message || 'Terjadi kesalahan saat menghapus pengguna.')
      }
    }
  }

  const accessLevelText = (level: number) => {
    switch (level) {
      case 1:
        return 'Viewer'
      case 2:
        return 'Editor'
      case 3:
        return 'Coordinator'
      case 4:
        return 'Admin'
      default:
        return 'Unknown'
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
          <span className='badge badge-soft badge-primary badge-xs'>
            {accessLevelText(user.accessLevel)}
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
        <button
          className='btn btn-ghost btn-square btn-sm'
          onClick={handleEditBtn}
          aria-label={`Edit ${user.fullName}`}
        >
          <EditIcon />
        </button>
        {isSelf ? (
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
        )}
      </div>
    </>
  )
}

export default MobileList
