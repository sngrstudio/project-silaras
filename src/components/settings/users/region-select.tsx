import { useState, useEffect, type FC } from 'react'
import clsx from 'clsx'
import { actions } from 'astro:actions'
import type { InferSelectModel } from 'drizzle-orm'
import type { region } from '~/db/schemas/region'
import { showErrorToast } from '~/components/common/toast/toast.store'

type Region = InferSelectModel<typeof region>

interface RegionSelectProps {
  accessLevel?: number
  value?: string | undefined
  onChange: (regionId: string | undefined) => void
  disabled?: boolean
  name?: string
  error?: string[] | undefined
  currentUser?: any // Current logged in user for access control
}

const RegionSelect: FC<RegionSelectProps> = ({
  accessLevel,
  value = '',
  onChange,
  disabled = false,
  name = 'regionId',
  error,
  currentUser
}) => {
  const [regions, setRegions] = useState<Region[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  // Get the region type based on access level
  const getRegionType = (
    level: number
  ): 'KABUPATEN' | 'KECAMATAN' | 'DESA' | null => {
    switch (level) {
      case 4:
        return 'KABUPATEN' // Admin
      case 3:
        return 'KECAMATAN' // Coordinator
      case 2:
        return 'DESA' // Editor
      case 1:
        return null // Viewer - no region assignment
      default:
        return null
    }
  }

  // Load regions based on access level
  useEffect(() => {
    const loadRegions = async () => {
      if (!accessLevel) return

      const regionType = getRegionType(accessLevel)
      if (!regionType) {
        setRegions([])
        return
      }

      try {
        setLoading(true)
        let data = await actions.region.getByType.orThrow({
          type: regionType
        })

        // Apply territorial restrictions for coordinators
        if (
          currentUser &&
          currentUser.accessLevel === 3 &&
          currentUser.regionId
        ) {
          const { canUserAssignToRegion } = await import(
            '~/utils/access-control'
          )

          // Get current user's region
          const currentUserRegion = await actions.region.getById.orThrow({
            id: currentUser.regionId
          })

          // Filter regions that the coordinator can assign users to
          data = data.filter((region) =>
            canUserAssignToRegion(currentUser, region, currentUserRegion)
          )
        }

        setRegions(data)
      } catch (error) {
        showErrorToast('Gagal memuat daftar wilayah.')
        setRegions([])
      } finally {
        setLoading(false)
      }
    }

    loadRegions()
  }, [accessLevel, currentUser])

  // Auto-assign for Admin (Kabupaten - only one exists)
  useEffect(() => {
    if (accessLevel === 4 && regions.length === 1 && regions[0]) {
      onChange(regions[0].id)
    }
  }, [accessLevel, regions, onChange])

  // Find current selected region
  const selectedRegion = regions.find((r) => r.id === value)

  // Filter regions based on search term
  const filteredRegions = regions.filter((region) =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Check if disabled (Viewer, or Admin with auto-assignment)
  const isDisabled =
    disabled ||
    !accessLevel ||
    accessLevel === 1 ||
    (accessLevel === 4 && regions.length === 1)

  const handleSelect = (region: Region) => {
    onChange(region.id)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = () => {
    onChange(undefined)
    setSearchTerm('')
  }

  const getLabel = () => {
    switch (accessLevel) {
      case 4:
        return 'Kabupaten'
      case 3:
        return 'Kecamatan'
      case 2:
        return 'Desa'
      default:
        return 'Wilayah'
    }
  }

  const getPlaceholder = () => {
    if (!accessLevel) return 'Pilih level akses terlebih dahulu'
    if (accessLevel === 1) return 'Viewer tidak memerlukan wilayah'
    if (accessLevel === 4 && regions.length === 1)
      return 'Otomatis: Kotawaringin Timur'

    switch (accessLevel) {
      case 4:
        return 'Pilih Kabupaten'
      case 3:
        return 'Pilih Kecamatan'
      case 2:
        return 'Pilih Desa'
      default:
        return 'Pilih wilayah'
    }
  }

  return (
    <div className='relative'>
      <label className='label' htmlFor={name}>
        {getLabel()} {accessLevel && accessLevel > 1 && '(Opsional)'}
      </label>

      <div className='relative'>
        <input
          type='text'
          id={name}
          value={selectedRegion?.name || ''}
          placeholder={getPlaceholder()}
          readOnly
          disabled={isDisabled}
          className={clsx('input w-full cursor-pointer', {
            'bg-base-200': isDisabled
          })}
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
        />

        {/* Hidden input for form submission */}
        <input type='hidden' name={name} value={value || ''} />

        {/* Clear button */}
        {selectedRegion && !isDisabled && (
          <button
            type='button'
            className='absolute top-1/2 right-8 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
            onClick={handleClear}
          >
            ✕
          </button>
        )}

        {/* Dropdown arrow */}
        <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 transform'>
          <svg
            className={clsx('h-4 w-4 transition-transform', {
              'rotate-180': isOpen
            })}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !isDisabled && (
        <div className='bg-base-100 border-base-300 absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-lg border shadow-lg'>
          {/* Search input */}
          <div className='border-base-300 border-b p-2'>
            <input
              type='text'
              className='input input-sm w-full'
              placeholder={`Cari ${getLabel().toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Options */}
          <div className='max-h-48 overflow-y-auto'>
            {loading ? (
              <div className='p-4 text-center text-gray-500'>
                <span className='loading loading-spinner loading-sm'></span>
                <span className='ml-2'>Memuat...</span>
              </div>
            ) : filteredRegions.length === 0 ? (
              <div className='p-4 text-center text-gray-500'>
                {searchTerm ? 'Tidak ada hasil ditemukan' : 'Tidak ada data'}
              </div>
            ) : (
              filteredRegions.map((region) => (
                <button
                  key={region.id}
                  type='button'
                  className={clsx(
                    'hover:bg-base-200 border-base-200 w-full border-b p-3 text-left last:border-b-0',
                    {
                      'bg-primary/10 text-primary':
                        selectedRegion?.id === region.id
                    }
                  )}
                  onClick={() => handleSelect(region)}
                >
                  <div className='font-medium'>{region.name}</div>
                  <div className='text-sm text-gray-500 capitalize'>
                    {region.type.toLowerCase()}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
      )}

      {/* Error message */}
      {error && <div className='label text-error'>{error.join(', ')}</div>}
    </div>
  )
}

export default RegionSelect
