import { type FC, useState, useMemo } from 'react'
import clsx from 'clsx'
import TableTemplate from '../../common/table/desktop'
import ListTemplate from '../../common/table/mobile'
import MobileList from './mobile-list'
import Navigation from './navigation'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import {
  $users,
  setCurrentUser,
  setUsers,
  type User,
  $currentPage
} from './users.store'
import { $currentUser as $globalCurrentUser } from '~/components/layout/drawer/drawer.store'
import { actions } from 'astro:actions'
import EditIcon from '~icons/lucide/pen'
import TrashIcon from '~icons/lucide/trash-2'
import WhatsAppIcon from '~icons/simple-icons/whatsapp'
import UserPlusIcon from '~icons/lucide/user-plus'
import SearchIcon from '~icons/lucide/search'
import KeyIcon from '~icons/lucide/key'
import MapPinIcon from '~icons/lucide/map-pin'
import PhoneIcon from '~icons/lucide/phone'
import Image from '~/components/common/image/image'
import {
  canUserEditUser,
  canUserDeleteUser,
  getAllowedAccessLevels,
  getAccessLevelName
} from '~/utils/access-control'
import { useUserRegion } from '~/utils/hooks/useUserRegion'
import {
  showSuccessToast,
  showErrorToast
} from '~/components/common/toast/toast.store'

const columnHelper = createColumnHelper<User>()

// Enhanced Avatar component with modern styling
const UserAvatar: FC<{
  profilePhoto: string | null | undefined
  fullName: string
  size?: 'sm' | 'md' | 'lg'
}> = ({ profilePhoto, fullName, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  const sizeClass = sizeClasses[size]

  return (
    <div className={clsx('avatar', !profilePhoto && 'avatar-placeholder')}>
      {profilePhoto ? (
        <div
          className={clsx(
            sizeClass,
            'mask ring-primary/20 ring-offset-base-100 mask-circle ring-2 ring-offset-2'
          )}
        >
          <Image
            className='object-cover'
            publicId={profilePhoto}
            width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
            height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
            sizes={size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px'}
            breakpoints={[32, 40, 48, 64, 80]}
            alt={fullName}
          />
        </div>
      ) : (
        <div
          className={clsx(
            'from-primary to-primary/80 text-primary-content ring-primary/20 ring-offset-base-100 flex aspect-square items-center justify-center rounded-full bg-gradient-to-br font-bold ring-2 ring-offset-2 transition-all duration-300 hover:scale-105',
            sizeClass
          )}
        >
          <span
            className={
              size === 'sm'
                ? 'text-xs'
                : size === 'md'
                  ? 'text-sm'
                  : 'text-base'
            }
          >
            {fullName.charAt(0).toUpperCase()}
          </span>
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

// Component for delete button with self-deletion protection
const UserDeleteButton: FC<{ user: User; onDelete: () => void }> = ({
  user,
  onDelete
}) => {
  const currentUser = useStore($globalCurrentUser)
  const isSelf = currentUser && currentUser.id === user.id

  if (isSelf) {
    return (
      <button
        className='btn btn-sm cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60'
        disabled
        title='Anda tidak dapat menghapus akun Anda sendiri'
        aria-label={`Cannot delete own account: ${user.fullName}`}
      >
        <TrashIcon className='h-4 w-4' />
        <span>Hapus</span>
      </button>
    )
  }

  return (
    <button
      className='btn btn-sm from-error to-error/80 border-error/30 text-error-content bg-gradient-to-r transition-all duration-300 hover:scale-105'
      onClick={onDelete}
      aria-label={`Delete ${user.fullName}`}
    >
      <TrashIcon className='h-4 w-4' />
      <span>Hapus</span>
    </button>
  )
}

const dColumns = [
  columnHelper.accessor('fullName', {
    header: 'Pengguna',
    enableSorting: true,
    cell: (cell) => (
      <div className='flex items-center gap-4'>
        <UserAvatar
          profilePhoto={cell.row.original.profilePhoto}
          fullName={cell.getValue()}
          size='md'
        />
        <div className='flex flex-col'>
          <div className='text-base-content font-bold'>{cell.getValue()}</div>
          <div className='text-base-content/60 flex items-center gap-1 text-sm'>
            <span>@{cell.row.original.username}</span>
          </div>
        </div>
      </div>
    )
  }),
  columnHelper.accessor('accessLevel', {
    header: 'Level Akses',
    enableSorting: true,
    cell: (cell) => {
      const accessLevel = cell.getValue()
      const colorClass = getAccessLevelColor(accessLevel)

      return (
        <div className='flex items-start gap-2'>
          <KeyIcon className={clsx('mt-0.5 h-4 w-4', colorClass)} />
          <span className={clsx('text-sm font-medium', colorClass)}>
            {getAccessLevelName(accessLevel)}
          </span>
        </div>
      )
    }
  }),
  columnHelper.accessor('regionName', {
    header: 'Wilayah',
    enableSorting: true,
    cell: (cell) => {
      const regionName = cell.getValue()
      const regionType = cell.row.original.regionType
      if (!regionName) {
        return (
          <div className='flex items-start gap-2'>
            <MapPinIcon className='mt-0.5 h-4 w-4 text-gray-400' />
            <span className='text-base-content/40 text-sm'>
              Tidak ada wilayah
            </span>
          </div>
        )
      }

      return (
        <div className='flex items-start gap-2'>
          <MapPinIcon className='text-info mt-0.5 h-4 w-4' />
          <div className='flex flex-col'>
            <span className='text-base-content text-sm font-medium'>
              {regionName}
            </span>
            <span className='text-base-content/60 text-xs capitalize'>
              {regionType?.toLowerCase()}
            </span>
          </div>
        </div>
      )
    }
  }),
  columnHelper.accessor('phoneNumber', {
    header: 'Kontak',
    enableSorting: false,
    cell: (cell) => {
      const phone = cell.getValue()
      if (!phone) {
        return (
          <div className='flex items-start gap-2'>
            <PhoneIcon className='mt-0.5 h-4 w-4 text-gray-400' />
            <span className='text-base-content/40 text-sm'>
              Tidak ada nomor
            </span>
          </div>
        )
      }

      return (
        <div className='flex items-start gap-3'>
          <PhoneIcon className='text-success mt-0.5 h-4 w-4' />
          <div className='flex items-center gap-2'>
            <span className='text-base-content text-sm font-medium'>
              {phone}
            </span>
            <a
              className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white transition-all duration-300 hover:scale-110 hover:bg-green-600'
              href={`https://wa.me/${phone.replace(/^08/, '628')}`}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='WhatsApp'
            >
              <WhatsAppIcon className='h-3 w-3' />
            </a>
          </div>
        </div>
      )
    }
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Aksi',
    enableSorting: false,
    cell: (cell) => {
      const currentUser = useStore($globalCurrentUser)
      const { userRegion } = useUserRegion()
      const user = cell.row.original

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
        setCurrentUser(cell.row.original)
      }

      const handleDeleteBtn = async () => {
        const user = cell.row.original
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
                showErrorToast(
                  'Hanya administrator yang dapat menghapus pengguna.'
                )
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
        <div className='flex items-center gap-2'>
          {canEdit ? (
            <button
              className='btn btn-sm from-primary to-primary/80 border-primary/30 text-primary-content bg-gradient-to-r transition-all duration-300 hover:scale-105'
              onClick={handleEditBtn}
              aria-label={`Edit ${user.fullName}`}
            >
              <EditIcon className='h-4 w-4' />
              <span>Edit</span>
            </button>
          ) : (
            // Show disabled button for fellow admins (Admin viewing other Admin)
            currentUser?.accessLevel === 4 &&
            user.accessLevel === 4 && (
              <button
                className='btn btn-sm cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60'
                disabled
                title='Tidak dapat mengedit sesama administrator'
              >
                <EditIcon className='h-4 w-4' />
                <span>Edit</span>
              </button>
            )
          )}
          {canDelete ? (
            <UserDeleteButton
              user={cell.row.original}
              onDelete={handleDeleteBtn}
            />
          ) : (
            // Show disabled delete button for fellow admins (Admin viewing other Admin)
            currentUser?.accessLevel === 4 &&
            user.accessLevel === 4 && (
              <button
                className='btn btn-sm cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60'
                disabled
                title='Tidak dapat menghapus sesama administrator'
              >
                <TrashIcon className='h-4 w-4' />
                <span>Hapus</span>
              </button>
            )
          )}
        </div>
      )
    }
  })
]

const mColumns = [
  columnHelper.display({
    id: 'mobile',
    cell: (cell) => {
      const currentUser = useStore($globalCurrentUser)
      return <MobileList cell={cell} currentUser={currentUser} />
    }
  })
]

const UsersRC: FC = () => {
  const users = useStore($users)
  const currentUser = useStore($globalCurrentUser)
  const [searchTerm, setSearchTerm] = useState('')

  // Check if current user can create users
  const allowedAccessLevels = getAllowedAccessLevels(currentUser)
  const canCreateUsers = allowedAccessLevels.length > 0

  // Filter users based on search term (client-side filtering for now)
  const filteredUsers = useMemo(() => {
    if (!users || !searchTerm.trim()) return users?.users || []

    const lowerSearchTerm = searchTerm.toLowerCase()
    return users.users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(lowerSearchTerm) ||
        user.regionName?.toLowerCase().includes(lowerSearchTerm) ||
        user.phoneNumber?.toLowerCase().includes(lowerSearchTerm)
    )
  }, [users, searchTerm])

  if (!users) {
    return <></>
  }

  return (
    <>
      {/* Header Section with Search and Add Button */}
      <div className='mb-8'>
        <div className='mb-6'>
          <h2 className='text-base-content mb-2 text-2xl font-bold'>
            Manajemen Pengguna
          </h2>
          <p className='text-base-content/60'>
            Kelola pengguna dan hak akses sistem
          </p>
        </div>

        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          {/* Search Input */}
          <div className='relative max-w-md flex-1'>
            <SearchIcon className='text-base-content/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <input
              type='text'
              placeholder='Cari pengguna, wilayah, atau nomor telepon...'
              className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 w-full pl-10 transition-all duration-200 focus:ring-2'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Add User Button */}
          {canCreateUsers && (
            <button
              className='btn from-primary to-primary/80 border-primary/30 text-primary-content bg-gradient-to-r shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'
              onClick={() => setCurrentUser({} as User)} // Empty user for new user creation
            >
              <UserPlusIcon className='h-5 w-5' />
              <span>Tambah Pengguna</span>
            </button>
          )}
        </div>
      </div>

      <UsersTableRenderer users={filteredUsers} />
      <Navigation />
    </>
  )
}

export default UsersRC

const UsersTableRenderer: FC<{ users: User[] }> = ({ users }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'accessLevel', desc: true }, // Sort by access level descending (4 first)
    { id: 'fullName', desc: false } // Then by name alphabetically
  ])

  // Sort users data for mobile table manually since mobile only has display column
  const sortedUsers = useMemo(() => {
    if (!sorting.length) return users

    return [...users].sort((a, b) => {
      for (const sort of sorting) {
        let aVal: any
        let bVal: any

        if (sort.id === 'accessLevel') {
          aVal = a.accessLevel
          bVal = b.accessLevel
        } else if (sort.id === 'fullName') {
          aVal = a.fullName
          bVal = b.fullName
        } else if (sort.id === 'regionName') {
          aVal = a.regionName || ''
          bVal = b.regionName || ''
        } else {
          continue
        }

        let comparison = 0
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal)
        } else {
          comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        }

        if (comparison !== 0) {
          return sort.desc ? -comparison : comparison
        }
      }
      return 0
    })
  }, [users, sorting])

  const dTable = useReactTable({
    columns: dColumns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    },
    onSortingChange: setSorting,
    initialState: {
      sorting: [
        { id: 'accessLevel', desc: true },
        { id: 'fullName', desc: false }
      ]
    }
  })

  const mTable = useReactTable({
    columns: mColumns,
    data: sortedUsers, // Use pre-sorted data for mobile
    getCoreRowModel: getCoreRowModel()
    // Remove sorting for mobile table since it only has one display column
  })

  return (
    <>
      <ListTemplate table={mTable} className='-mx-6 md:hidden' />
      <TableTemplate table={dTable} className='max-md:hidden' />
    </>
  )
}
