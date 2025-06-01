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
      <div className='mb-4'>
        <input
          type='text'
          placeholder='Cari wilayah berdasarkan nama atau jenis...'
          className='input input-bordered w-full max-w-md'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
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
        header: 'Nama Wilayah',
        enableSorting: true,
        cell: (cell) => {
          const region = cell.row.original
          const canAccess =
            userRegion && !loading
              ? canUserAccessRegionSync(currentUser, region, userRegion)
              : false

          return (
            <div className='flex flex-col'>
              {canAccess ? (
                <a className='link font-bold' href={`/region/${region.slug}`}>
                  {cell.getValue()}
                </a>
              ) : (
                <span
                  className='font-bold text-gray-500'
                  title='Anda tidak memiliki akses ke wilayah ini'
                >
                  {cell.getValue()}
                </span>
              )}
              <span className='text-sm text-gray-500 capitalize'>
                {region.type.toLowerCase()}
              </span>
            </div>
          )
        }
      }),
      columnHelper.accessor('type', {
        header: 'Jenis',
        enableSorting: true,
        cell: (cell) => (
          <span className='badge badge-soft badge-neutral badge-sm'>
            {cell.getValue()}
          </span>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
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
                  className='btn btn-soft btn-primary btn-xs'
                  href={`/region/${region.slug}`}
                >
                  <span>Lihat</span>
                </a>
              ) : (
                <button
                  className='btn btn-soft btn-neutral btn-xs'
                  disabled
                  title='Anda tidak memiliki akses ke wilayah ini'
                >
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
