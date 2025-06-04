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

// Avatar component that handles profile photo display
const UserAvatar: FC<{
  profilePhoto: string | null | undefined
  fullName: string
  size?: 'sm' | 'md'
}> = ({ profilePhoto, fullName, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-8' : 'w-10'

  return (
    <div className={clsx('avatar', { 'avatar-placeholder': !profilePhoto })}>
      {profilePhoto ? (
        <div className={clsx(sizeClass, 'mask mask-circle')}>
          <Image
            publicId={profilePhoto}
            width={size === 'sm' ? 32 : 40}
            height={size === 'sm' ? 32 : 40}
            alt={fullName}
          />
        </div>
      ) : (
        <div
          className={clsx(
            'bg-primary text-primary-content aspect-square rounded-full',
            sizeClass
          )}
        >
          <span className={size === 'sm' ? 'text-xs' : 'text-xl'}>
            {fullName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
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
        className='btn btn-soft btn-error btn-xs cursor-not-allowed opacity-50'
        disabled
        title='Anda tidak dapat menghapus akun Anda sendiri'
        aria-label={`Cannot delete own account: ${user.fullName}`}
      >
        <TrashIcon />
        <span>Hapus</span>
      </button>
    )
  }

  return (
    <button
      className='btn btn-soft btn-error btn-xs'
      onClick={onDelete}
      aria-label={`Delete ${user.fullName}`}
    >
      <TrashIcon />
      <span>Hapus</span>
    </button>
  )
}

const dColumns = [
  columnHelper.accessor('fullName', {
    header: 'Nama Lengkap',
    enableSorting: true,
    cell: (cell) => (
      <div className='flex items-center gap-3'>
        <UserAvatar
          profilePhoto={cell.row.original.profilePhoto}
          fullName={cell.getValue()}
        />
        <div>
          <div className='font-bold'>{cell.getValue()}</div>
          <div className='text-sm opacity-75'>
            @{cell.row.original.username}
          </div>
        </div>
      </div>
    )
  }),
  columnHelper.accessor('accessLevel', {
    header: 'Level Akses',
    enableSorting: true,
    cell: (cell) => (
      <span
        className='badge badge-soft badge-primary badge-sm line-clamp-1'
        title={getAccessLevelName(cell.getValue())}
      >
        {getAccessLevelName(cell.getValue())}
      </span>
    )
  }),
  columnHelper.accessor('regionName', {
    header: 'Wilayah',
    enableSorting: true,
    cell: (cell) => {
      const regionName = cell.getValue()
      const regionType = cell.row.original.regionType
      if (!regionName) return <span className='text-gray-400'>-</span>

      return (
        <div>
          <div className='font-medium'>{regionName}</div>
          <div className='text-xs text-gray-500 capitalize'>
            {regionType?.toLowerCase()}
          </div>
        </div>
      )
    }
  }),
  columnHelper.accessor('phoneNumber', {
    header: 'Nomor Telepon',
    enableSorting: false,
    cell: (cell) => {
      const phone = cell.getValue()
      if (!phone) return <span className='text-gray-400'>-</span>

      return (
        <div className='flex items-center gap-2'>
          <span>{phone}</span>
          <a
            className='btn btn-ghost btn-xs'
            href={`https://wa.me/${phone.replace(/^08/, '628')}`}
            target='_blank'
            aria-label='WhatsApp'
          >
            <WhatsAppIcon />
          </a>
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
        <div className='flex gap-2'>
          {canEdit ? (
            <button
              className='btn btn-soft btn-primary btn-xs'
              onClick={handleEditBtn}
            >
              <EditIcon />
              <span>Edit</span>
            </button>
          ) : (
            // Show disabled button for fellow admins (Admin viewing other Admin)
            currentUser?.accessLevel === 4 &&
            user.accessLevel === 4 && (
              <button
                className='btn btn-soft btn-primary btn-xs cursor-not-allowed opacity-50'
                disabled
                title='Tidak dapat mengedit sesama administrator'
              >
                <EditIcon />
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
                className='btn btn-soft btn-error btn-xs cursor-not-allowed opacity-50'
                disabled
                title='Tidak dapat menghapus sesama administrator'
              >
                <TrashIcon />
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
      <div className='mb-4'>
        <h2 className='mb-3 text-lg font-semibold'>Daftar Pengguna</h2>
        <div className='flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:gap-2'>
          {canCreateUsers && (
            <button
              className='btn btn-primary btn-sm w-full sm:w-auto'
              onClick={() => setCurrentUser({} as User)} // Empty user for new user creation
            >
              <UserPlusIcon />
              <span>Tambah Pengguna</span>
            </button>
          )}
          <div className='relative flex-1 sm:flex-none'>
            <input
              type='text'
              placeholder='Cari pengguna...'
              className='input input-bordered input-sm w-full sm:w-48'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
