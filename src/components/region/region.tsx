/**
 * @fileoverview Region Management Component
 *
 * This component provides a comprehensive interface for managing regions within the SILARAS platform.
 * It features a responsive table/list view with sorting capabilities, region navigation,
 * and role-based access controls for different user permissions.
 *
 * Key Features:
 * - Responsive design with desktop table and mobile list views
 * - Real-time region data synchronization using nanostores
 * - Region-based navigation and filtering
 * - Role-based access control for region visibility
 * - Sorting and filtering capabilities for region data
 * - Sub-region management and hierarchical display
 *
 * Security Features:
 * - User region access verification
 * - Role-based region visibility controls
 * - Sanitized region data handling
 *
 * @module Components/Region
 * @author SNGR Creative
 * @since 1.0.0
 */
// filepath: /workspaces/project-dashat/src/components/region/region.tsx

import { type FC, useState, useMemo } from 'react'
import TableTemplate from '../common/table/desktop'
import ListTemplate from '../common/table/mobile'
import MobileList from './subregion/mobile-list'
import Navigation from './subregion/navigation'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import { $regions, type Regions } from './subregion/region.store'
import { canUserAccessRegionSync } from '../../utils/access-control'
import { useUserRegion } from '../../utils/hooks/useUserRegion'
import IconBuilding from '~icons/lucide/building'
import IconMapPin from '~icons/lucide/map-pin'
import IconUsers from '~icons/lucide/users'
import IconExternalLink from '~icons/lucide/external-link'
import IconSearch from '~icons/lucide/search'

const columnHelper = createColumnHelper<Regions['data'][number]>()

const RegionRC: FC = () => {
  const regions = useStore($regions)
  const { currentUser, userRegion, loading } = useUserRegion()
  const [searchInput, setSearchInput] = useState('')

  if (!regions) {
    return <></>
  }

  // Filter regions based on search input
  const filteredData = useMemo(() => {
    if (!searchInput.trim()) {
      return regions.data
    }

    const search = searchInput.toLowerCase()
    return regions.data.filter(
      (region) =>
        region.name.toLowerCase().includes(search) ||
        region.type.toLowerCase().includes(search)
    )
  }, [regions.data, searchInput])

  return (
    <>
      {/* Search Input */}
      <div className='mb-6'>
        <div className='relative max-w-md'>
          <IconSearch className='text-base-content/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <input
            type='text'
            placeholder='Cari wilayah berdasarkan nama atau jenis...'
            className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 w-full pl-10 transition-all duration-200 focus:ring-2'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      <RegionTableRenderer
        regions={{ ...regions, data: filteredData }}
        currentUser={currentUser}
        userRegion={userRegion}
        loading={loading}
      />
      <Navigation />
    </>
  )
}

export default RegionRC

const RegionTableRenderer: FC<{
  regions: Regions
  currentUser:
    | Awaited<
        ReturnType<
          typeof import('astro:actions').actions.user.getCurrent.orThrow
        >
      >
    | undefined
  userRegion: {
    id: string
    name: string
    slug: string
    type: 'KABUPATEN' | 'KECAMATAN' | 'DESA'
    parentId?: string | null
  } | null
  loading: boolean
}> = ({ regions, currentUser, userRegion, loading }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'type', desc: false }, // Sort by type first (KABUPATEN, KECAMATAN, DESA)
    { id: 'name', desc: false } // Then by name alphabetically
  ])

  // Create columns with access control
  const dColumnsWithAccess = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => (
          <div className='flex items-center gap-2'>
            <IconBuilding className='text-primary h-4 w-4' />
            <span>Nama Wilayah</span>
          </div>
        ),
        enableSorting: true,
        cell: (cell) => {
          const region = cell.row.original
          const canAccess =
            userRegion && !loading
              ? canUserAccessRegionSync(currentUser, region, userRegion)
              : false

          const getTypeIcon = () => {
            switch (region.type) {
              case 'KABUPATEN':
                return IconBuilding
              case 'KECAMATAN':
                return IconMapPin
              case 'DESA':
                return IconUsers
              default:
                return IconMapPin
            }
          }

          const getTypeColor = () => {
            switch (region.type) {
              case 'KABUPATEN':
                return 'text-primary'
              case 'KECAMATAN':
                return 'text-info'
              case 'DESA':
                return 'text-success'
              default:
                return 'text-neutral'
            }
          }

          const IconComponent = getTypeIcon()

          return (
            <div className='flex items-center gap-3'>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${getTypeColor()}`}
              >
                <IconComponent className='h-4 w-4' />
              </div>
              <div className='flex flex-col'>
                {canAccess ? (
                  <a
                    className='text-primary hover:text-primary/80 font-bold transition-colors duration-200'
                    href={`/region/${region.slug}`}
                  >
                    {cell.getValue()}
                  </a>
                ) : (
                  <span
                    className='text-base-content/50 font-bold'
                    title='Anda tidak memiliki akses ke wilayah ini'
                  >
                    {cell.getValue()}
                  </span>
                )}
                <span className={`text-xs font-medium ${getTypeColor()}`}>
                  {region.type}
                </span>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('type', {
        header: () => (
          <div className='flex items-center gap-2'>
            <IconMapPin className='text-info h-4 w-4' />
            <span>Jenis</span>
          </div>
        ),
        enableSorting: true,
        cell: (cell) => {
          const getTypeColor = () => {
            switch (cell.getValue()) {
              case 'KABUPATEN':
                return 'badge-primary bg-primary/20 text-primary border-primary/30'
              case 'KECAMATAN':
                return 'badge-info bg-info/20 text-info border-info/30'
              case 'DESA':
                return 'badge-success bg-success/20 text-success border-success/30'
              default:
                return 'badge-neutral bg-neutral/20 text-neutral border-neutral/30'
            }
          }

          const getTypeIcon = () => {
            switch (cell.getValue()) {
              case 'KABUPATEN':
                return IconBuilding
              case 'KECAMATAN':
                return IconMapPin
              case 'DESA':
                return IconUsers
              default:
                return IconMapPin
            }
          }

          const IconComponent = getTypeIcon()

          return (
            <span
              className={`badge badge-sm rounded-full px-3 py-1 font-medium ${getTypeColor()}`}
            >
              <IconComponent className='mr-1 h-3 w-3' />
              {cell.getValue()}
            </span>
          )
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: () => (
          <div className='flex items-center gap-2'>
            <IconExternalLink className='text-neutral h-4 w-4' />
            <span>Aksi</span>
          </div>
        ),
        enableSorting: false,
        cell: (cell) => {
          const region = cell.row.original
          const canAccess =
            userRegion && !loading
              ? canUserAccessRegionSync(currentUser, region, userRegion)
              : false

          return (
            <div className='flex gap-2'>
              {canAccess ? (
                <a
                  className='btn btn-primary btn-sm transition-all duration-200 hover:scale-105 hover:shadow-md'
                  href={`/region/${region.slug}`}
                  title='Lihat detail wilayah'
                >
                  <IconExternalLink className='h-4 w-4' />
                  <span>Lihat</span>
                </a>
              ) : (
                <button
                  className='btn btn-neutral btn-sm opacity-50'
                  disabled
                  title='Anda tidak memiliki akses ke wilayah ini'
                >
                  <IconExternalLink className='h-4 w-4' />
                  <span>Lihat</span>
                </button>
              )}
            </div>
          )
        }
      })
    ],
    [currentUser, userRegion, loading]
  )

  const mColumnsWithAccess = useMemo(
    () => [
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
    ],
    [currentUser, userRegion, loading]
  )

  // Sort data manually for mobile table
  const sortedData = useMemo(() => {
    if (sorting.length === 0) return regions.data

    return [...regions.data].sort((a, b) => {
      for (const sort of sorting) {
        let aValue: string | number = ''
        let bValue: string | number = ''

        if (sort.id === 'name') {
          aValue = a.name
          bValue = b.name
        } else if (sort.id === 'type') {
          // Custom sort order for region types
          const typeOrder = { KABUPATEN: 1, KECAMATAN: 2, DESA: 3 }
          aValue = typeOrder[a.type as keyof typeof typeOrder] || 4
          bValue = typeOrder[b.type as keyof typeof typeOrder] || 4
        }

        if (aValue < bValue) return sort.desc ? 1 : -1
        if (aValue > bValue) return sort.desc ? -1 : 1
      }
      return 0
    })
  }, [regions.data, sorting])

  const dTable = useReactTable({
    columns: dColumnsWithAccess,
    data: regions.data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting
  })

  const mTable = useReactTable({
    columns: mColumnsWithAccess,
    data: sortedData, // Use pre-sorted data for mobile
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      <ListTemplate table={mTable} className='-mx-6 md:hidden' />
      <TableTemplate table={dTable} className='max-md:hidden' />
    </>
  )
}
