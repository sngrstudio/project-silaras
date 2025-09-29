/**
 * @fileoverview Target Management Component
 *
 * This component provides comprehensive target management functionality within the SILARAS platform.
 * It features a responsive table/list view with sorting, filtering, and CRUD operations for targets,
 * along with role-based access controls and real-time data synchronization.
 *
 * Key Features:
 * - Responsive design with desktop table and mobile list views
 * - Real-time target data synchronization using nanostores
 * - Target creation, editing, and deletion capabilities
 * - Advanced sorting and filtering options
 * - Role-based access control for target management
 * - Bulk operations and selection management
 *
 * Target Management:
 * - Individual target profile management
 * - Age calculation and demographic information
 * - Assessment status tracking and completion rates
 * - Target status management (active/inactive)
 * - Geographic region association
 *
 * Security Features:
 * - User permission verification for target operations
 * - Region-based access control
 * - Sanitized data handling and validation
 *
 * @module Components/Region/Target
 * @author SNGR Creative
 * @since 1.0.0
 */
// filepath: /workspaces/project-dashat/src/components/region/target/target.tsx

import { type FC, useState, useMemo } from 'react'
import clsx from 'clsx'
import TableTemplate from '~/components/common/table/desktop'
import ListTemplate from '~/components/common/table/mobile'
import MobileList from './mobile-list'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import {
  $currentRegion,
  $targets,
  $targetsPagination,
  setCurrentTarget,
  setCurrentPage,
  type Targets
} from './target.store'
import Pagination from '~/components/common/pagination/pagination'
import AddTargetIcon from '~icons/lucide/user-plus'
import EditIcon from '~icons/lucide/pen'
import WhatsAppIcon from '~icons/simple-icons/whatsapp'
import GMapsIcon from '~icons/simple-icons/googlemaps'
import IconUser from '~icons/lucide/user'
import IconClock from '~icons/lucide/clock'
import IconTag from '~icons/lucide/tag'
import IconPhone from '~icons/lucide/phone'
import IconMapPin from '~icons/lucide/map-pin'
import { canUserAccessTargetSync } from '../../../utils/access-control'
import { useUserRegion } from '../../../utils/hooks/useUserRegion'
import {
  showSuccessToast,
  showErrorToast
} from '~/components/common/toast/toast.store'

type Target = Targets[number]

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

// Helper function to copy text to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showSuccessToast('Nomor telepon berhasil disalin!')
  } catch (err) {
    showErrorToast('Gagal menyalin nomor telepon.')
  }
}

const columnHelper = createColumnHelper<Target>()

// Function to create dynamic columns with access control
const createDesktopColumns = (
  currentUser: any,
  userRegion: any,
  currentRegion: any,
  loading: boolean
) => [
  columnHelper.accessor('name', {
    header: () => (
      <div className='flex items-center gap-2'>
        <IconUser className='text-primary h-4 w-4' />
        <span>Nama</span>
      </div>
    ),
    enableSorting: true,
    cell: (cell) => {
      const url = `/target/${cell.row.original.slug}`

      // Check if user can access this target
      const canAccess =
        !loading &&
        currentRegion &&
        userRegion &&
        canUserAccessTargetSync(currentUser, currentRegion, userRegion)

      if (canAccess) {
        return (
          <a
            className='link link-primary hover:text-primary/80 font-bold transition-colors duration-200'
            href={url}
          >
            {cell.getValue()}
          </a>
        )
      } else {
        return (
          <span
            className='text-base-content/50 cursor-not-allowed font-bold'
            title='Anda tidak memiliki akses ke sasaran ini'
          >
            {cell.getValue()}
          </span>
        )
      }
    }
  }),
  columnHelper.accessor('age', {
    header: () => (
      <div className='flex items-center gap-2'>
        <IconClock className='text-accent h-4 w-4' />
        <span>Umur</span>
      </div>
    ),
    enableSorting: true,
    cell: (cell) => {
      const age = cell.getValue()
      if (!age) {
        return <span className='text-base-content/40'>-</span>
      }

      return (
        <div className='flex items-center gap-2'>
          <span className='font-medium'>
            {age <= 24
              ? `${age} bulan`
              : `${Math.floor(age / 12)} tahun ${age % 12} bulan`}
          </span>
        </div>
      )
    }
  }),
  columnHelper.accessor('status', {
    header: () => (
      <div className='flex items-center gap-2'>
        <IconTag className='text-info h-4 w-4' />
        <span>Status</span>
      </div>
    ),
    enableSorting: true,
    cell: (cell) => {
      const status = cell.getValue()
      return (
        <span
          className={clsx('badge badge-sm rounded-full px-3 py-1 font-medium', {
            'badge-primary bg-primary/20 text-primary border-primary/30':
              status === 'HAMIL',
            'badge-accent bg-accent/20 text-accent border-accent/30':
              status === 'MENYUSUI',
            'badge-success bg-success/20 text-success border-success/30':
              status === 'ANAK-ANAK'
          })}
        >
          {getStatusDisplayName(status)}
        </span>
      )
    }
  }),
  columnHelper.accessor('phoneNumber', {
    header: () => (
      <div className='flex items-center gap-2'>
        <IconPhone className='text-success h-4 w-4' />
        <span>No. Telepon</span>
      </div>
    ),
    enableSorting: false,
    cell: (cell) => {
      const phone = cell.getValue()
      if (!phone) return <span className='text-base-content/40'>-</span>

      const handleCopyPhone = () => {
        copyToClipboard(phone)
      }

      return (
        <div className='flex items-center gap-2'>
          <button
            onClick={handleCopyPhone}
            className='text-success hover:text-success/80 cursor-pointer font-medium transition-colors duration-200'
            title='Klik untuk menyalin nomor telepon'
          >
            {phone}
          </button>
          <a
            className='btn btn-ghost btn-xs text-success hover:bg-success/10 transition-colors duration-200'
            href={`https://wa.me/${phone.replace(/^08/, '628')}`}
            target='_blank'
            aria-label='WhatsApp'
          >
            <WhatsAppIcon className='h-4 w-4' />
          </a>
        </div>
      )
    }
  }),
  columnHelper.display({
    id: 'd-actions',
    header: () => (
      <div className='flex items-center gap-2'>
        <IconMapPin className='text-neutral h-4 w-4' />
        <span>Aksi</span>
      </div>
    ),
    enableSorting: false,
    cell: (cell) => {
      const canAccess =
        !loading &&
        currentRegion &&
        userRegion &&
        canUserAccessTargetSync(currentUser, currentRegion, userRegion)

      const handleEditBtn = () => {
        setCurrentTarget(cell.row.original)
      }

      return (
        <div className='flex gap-2'>
          <button
            className={clsx(
              'btn btn-sm transition-all duration-200 hover:scale-105',
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
            className='btn btn-neutral btn-sm transition-all duration-200 hover:scale-105 hover:shadow-md'
            href={`https://www.google.com/maps/search/?api=1&query=${cell.row.original.latitude},${cell.row.original.longitude}`}
            target='_blank'
          >
            <GMapsIcon className='h-4 w-4' />
            <span>Lokasi</span>
          </a>
        </div>
      )
    }
  })
]

// Function to create mobile columns with access control
const createMobileColumns = (
  currentUser: any,
  userRegion: any,
  loading: boolean
) => [
  columnHelper.display({
    id: 'mobile',
    cell: (cell) => (
      <MobileList
        cell={cell}
        currentUser={currentUser}
        userRegion={userRegion}
        loading={loading}
      />
    )
  })
]

const TargetRC: FC = () => {
  const targets = useStore($targets)
  const currentRegion = useStore($currentRegion)
  const pagination = useStore($targetsPagination)
  const [searchInput, setSearchInput] = useState('')
  const { userRegion, loading, currentUser } = useUserRegion()

  // Filter targets based on search input
  const filteredData = useMemo(() => {
    if (!targets || !searchInput.trim()) {
      return targets || []
    }

    const search = searchInput.toLowerCase()
    return targets.filter(
      (target) =>
        target.name.toLowerCase().includes(search) ||
        target.status.toLowerCase().includes(search) ||
        target.phoneNumber?.toLowerCase().includes(search) ||
        target.motherName?.toLowerCase().includes(search)
    )
  }, [targets, searchInput])

  // Handle pagination
  const handlePageChange = async (page: number) => {
    if (!currentRegion) return

    setCurrentPage(page)
    // The page change will trigger a reload in the Astro component
    const event = new CustomEvent('targetPageChange', { detail: { page } })
    window.dispatchEvent(event)
  }

  const handlePageSizeChange = async (size: number) => {
    if (!currentRegion) return

    setCurrentPage(1) // Reset to first page when changing page size
    // The page size change will trigger a reload in the Astro component
    const event = new CustomEvent('targetPageSizeChange', { detail: { size } })
    window.dispatchEvent(event)
  }

  if (!targets) return <></>

  return (
    <>
      {/* Search and Add Button in same line */}
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <input
          type='text'
          placeholder='Cari sasaran berdasarkan nama, status, atau nomor telepon...'
          className='input input-bordered w-full sm:max-w-md'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <TargetAddButton />
      </div>

      <TargetTableRenderer
        data={filteredData}
        currentUser={currentUser}
        userRegion={userRegion}
        currentRegion={currentRegion}
        loading={loading}
      />

      {/* Pagination Controls */}
      {pagination && pagination.totalCount > 0 && (
        <div className='mt-6'>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      )}
    </>
  )
}

export default TargetRC

const TargetTableRenderer: FC<{
  data: Targets
  currentUser: any
  userRegion: any
  currentRegion: any
  loading: boolean
}> = ({ data, currentUser, userRegion, currentRegion, loading }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false } // Default sort by name alphabetically
  ])

  // Create dynamic columns with access control
  const dColumns = useMemo(
    () => createDesktopColumns(currentUser, userRegion, currentRegion, loading),
    [currentUser, userRegion, currentRegion, loading]
  )

  const mColumns = useMemo(
    () => createMobileColumns(currentUser, userRegion, loading),
    [currentUser, userRegion, loading]
  )

  // Sort data manually for mobile table
  const sortedData = useMemo(() => {
    if (sorting.length === 0) return data

    return [...data].sort((a, b) => {
      for (const sort of sorting) {
        let aValue: string | number = ''
        let bValue: string | number = ''

        if (sort.id === 'name') {
          aValue = a.name
          bValue = b.name
        } else if (sort.id === 'age') {
          aValue = a.age || 0
          bValue = b.age || 0
        } else if (sort.id === 'status') {
          // Custom sort order for target status
          const statusOrder = { 'ANAK-ANAK': 1, HAMIL: 2, MENYUSUI: 3 }
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 4
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 4
        }

        if (aValue < bValue) return sort.desc ? 1 : -1
        if (aValue > bValue) return sort.desc ? -1 : 1
      }
      return 0
    })
  }, [data, sorting])

  const dTable = useReactTable({
    columns: dColumns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting
  })

  const mTable = useReactTable({
    columns: mColumns,
    data: sortedData, // Use pre-sorted data for mobile
    getCoreRowModel: getCoreRowModel()
  })

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className='py-8 text-center'>
        <div className='text-base-content/70 text-lg'>
          Belum ada data sasaran
        </div>
        <div className='text-base-content/50 mt-1 text-sm'>
          Silakan tambah sasaran baru untuk memulai
        </div>
      </div>
    )
  }

  return (
    <>
      <ListTemplate table={mTable} className='-mx-6 md:hidden' />
      <TableTemplate table={dTable} className='max-md:hidden' />
    </>
  )
}

export const TargetAddButton: FC = () => {
  const currentRegion = useStore($currentRegion)

  const handleClick = async () => {
    setCurrentTarget({
      name: '',
      motherName: '',
      birthDate: new Date(Date.now()),
      initialHeight: 0,
      initialWeight: 0,
      status: 'ANAK-ANAK',
      latitude: 0,
      longitude: 0,
      regionId: currentRegion?.id!,
      id: '',
      address: '',
      phoneNumber: ''
    })
  }

  return (
    <button
      className='btn btn-primary w-full whitespace-nowrap sm:w-auto'
      onClick={handleClick}
    >
      <AddTargetIcon />
      <span>Tambah Sasaran</span>
    </button>
  )
}
