/**
 * @fileoverview Subregion Management Component
 *
 * This component provides detailed management and display of subregions within the SILARAS platform.
 * It handles hierarchical region data, provides navigation controls, and offers comprehensive
 * subregion information display with responsive design patterns.
 *
 * Key Features:
 * - Hierarchical subregion data management
 * - Real-time subregion synchronization using nanostores
 * - Responsive grid layout for subregion cards
 * - Interactive navigation and pagination
 * - Search and filtering capabilities
 * - WhatsApp integration for region contacts
 *
 * Display Features:
 * - Region type indicators (Kabupaten, Kecamatan, Desa)
 * - Child region and target count displays
 * - User count and management information
 * - Quick access navigation links
 *
 * @module Components/Region/Subregion
 * @author SNGR Creative
 * @since 1.0.0
 */
// filepath: /workspaces/project-dashat/src/components/region/subregion/region.tsx

import { type FC, useEffect, useState, useMemo } from 'react'
import * as React from 'react'
import Navigation from './navigation'
import { useStore } from '@nanostores/react'
import { $regions, setRegions, type Regions } from './region.store'
import IconBuilding from '~icons/lucide/building'
import IconMapPin from '~icons/lucide/map-pin'
import IconUsers from '~icons/lucide/users'
import IconExternalLink from '~icons/lucide/external-link'
import IconSearch from '~icons/lucide/search'

interface RegionRCProps {
  regionsData?: Regions | undefined
}

const RegionRC: FC<RegionRCProps> = ({ regionsData }) => {
  const regions = useStore($regions)
  const [searchInput, setSearchInput] = useState('')

  // Set regions data immediately to prevent hydration mismatch
  useEffect(() => {
    if (regionsData) {
      setRegions(regionsData)
    }
  }, [regionsData])

  // Filter and sort regions based on search input and user assignment
  const filteredAndSortedRegions = useMemo(() => {
    if (!regions) return undefined

    let filteredData = regions.data

    // Apply search filter
    if (searchInput.trim()) {
      const search = searchInput.toLowerCase()
      filteredData = regions.data.filter(
        (region) =>
          region.name.toLowerCase().includes(search) ||
          region.childRegionCount.toString().includes(search) ||
          region.userCount.toString().includes(search)
      )

      // Sort filtered data by user assignment first (regions with users assigned first), then alphabetically
      // This is needed because search filtering changes the original database order
      filteredData = [...filteredData].sort((a, b) => {
        // Primary sort: regions with users assigned come first
        const aHasUsers = a.userCount > 0
        const bHasUsers = b.userCount > 0

        if (aHasUsers && !bHasUsers) return -1
        if (!aHasUsers && bHasUsers) return 1

        // Secondary sort: alphabetical by name
        return a.name.localeCompare(b.name)
      })
    }
    // If no search filter, data is already sorted correctly by the database query

    return {
      ...regions,
      data: filteredData
    }
  }, [regions, searchInput])

  if (!filteredAndSortedRegions) {
    return <></>
  }

  return (
    <>
      {/* Search Input */}
      <div className='mb-6'>
        <div className='relative max-w-md'>
          <IconSearch className='text-base-content/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <input
            type='text'
            placeholder='Cari wilayah berdasarkan nama atau jumlah...'
            className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 w-full pl-10 transition-all duration-200 focus:ring-2'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      <RegionCardGrid regions={filteredAndSortedRegions} />
      <Navigation />
    </>
  )
}

export default RegionRC

const RegionCardGrid: FC<{ regions: Regions }> = ({ regions }) => {
  return (
    <div className='grid grid-cols-1 gap-6 p-4 max-sm:-mx-[1.5rem] max-sm:w-auto sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
      {regions.data.map((region) => (
        <RegionCard key={region.id} region={region} />
      ))}
    </div>
  )
}

const RegionCard: FC<{ region: Regions['data'][number] }> = ({ region }) => {
  const isDesaType = region.type === 'DESA'
  const hasUsers = region.userCount > 0
  const isDisabled = !hasUsers

  // Parse managed by users data
  const managedByUsers = React.useMemo(() => {
    if (!region.managedByUsers) return []
    try {
      // Parse the JSON string returned from GROUP_CONCAT
      const parsed = JSON.parse(`[${region.managedByUsers}]`)
      return parsed.filter((user: any) => user && user.fullName)
    } catch {
      return []
    }
  }, [region.managedByUsers])

  const getSubRegionLabel = () => {
    if (region.type === 'KABUPATEN') return 'Kecamatan'
    if (region.type === 'KECAMATAN') return 'Desa'
    return 'Sub Wilayah'
  }

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
        return 'text-primary bg-primary/10 border-primary/20'
      case 'KECAMATAN':
        return 'text-info bg-info/10 border-info/20'
      case 'DESA':
        return 'text-success bg-success/10 border-success/20'
      default:
        return 'text-neutral bg-neutral/10 border-neutral/20'
    }
  }

  const IconComponent = getTypeIcon()

  // Generate different styles based on disabled state
  const cardClasses = isDisabled
    ? 'block overflow-hidden rounded-2xl border border-base-300/50 bg-gradient-to-br from-base-100/50 to-base-200/25 shadow-sm opacity-60 cursor-not-allowed'
    : 'group block transform overflow-hidden rounded-2xl border border-base-300 bg-gradient-to-br from-base-100 to-base-200/50 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 cursor-pointer'

  const iconClasses = isDisabled
    ? `flex h-12 w-12 items-center justify-center rounded-xl border ${getTypeColor()}`
    : `flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 ${getTypeColor()}`

  const externalIconClasses = isDisabled
    ? 'h-4 w-4 text-base-content/20'
    : 'h-4 w-4 text-base-content/40 transition-all duration-300 group-hover:text-primary group-hover:scale-110'

  const titleClasses = isDisabled
    ? 'mb-4 line-clamp-2 text-lg font-bold text-base-content/60'
    : 'mb-4 line-clamp-2 text-lg font-bold text-base-content transition-colors duration-300 group-hover:text-primary'

  const statClasses = isDisabled
    ? 'flex items-center justify-between rounded-lg bg-base-100/30 p-3'
    : 'flex items-center justify-between rounded-lg bg-base-100/50 p-3 transition-all duration-300 group-hover:bg-base-100'

  const badgeClasses = isDisabled
    ? `inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${getTypeColor()}`
    : `inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300 group-hover:scale-105 ${getTypeColor()}`

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not disabled and target is not a link
    if (!isDisabled && !(e.target as HTMLElement).closest('a')) {
      window.location.href = `/region/${region.slug}`
    }
  }

  return (
    <div
      className={cardClasses}
      onClick={handleCardClick}
      role={isDisabled ? undefined : 'button'}
      tabIndex={isDisabled ? undefined : 0}
      onKeyDown={
        isDisabled
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                window.location.href = `/region/${region.slug}`
              }
            }
      }
    >
      {/* Header with gradient and icon */}
      <div className='from-primary/5 via-primary/10 to-primary/5 bg-gradient-to-r p-4 pb-0'>
        <div className='mb-3 flex items-center justify-between'>
          <div className={iconClasses}>
            <IconComponent className='h-6 w-6' />
          </div>
          <IconExternalLink className={externalIconClasses} />
        </div>
      </div>

      {/* Content */}
      <div className='p-4 pt-2'>
        <h3 className={titleClasses}>{region.name}</h3>

        <div className='space-y-3'>
          {/* Managed by users display */}
          <div className={statClasses}>
            <div className='flex items-center gap-2'>
              <IconUsers className='text-primary h-4 w-4' />
              <span className='text-base-content/70 text-sm font-medium'>
                Dikelola oleh:
              </span>
            </div>
            <div className='flex items-center gap-2'>
              {hasUsers ? (
                <div className='text-right'>
                  {managedByUsers.map((user: any, index: number) => (
                    <div key={index}>
                      {user.phoneNumber ? (
                        <a
                          href={`https://wa.me/${user.phoneNumber.replace(/\D/g, '')}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className={`text-primary text-xs font-medium transition-colors duration-300 ${
                            isDisabled
                              ? 'cursor-not-allowed opacity-60'
                              : 'hover:text-green-600 hover:underline'
                          }`}
                          onClick={
                            isDisabled ? (e) => e.preventDefault() : undefined
                          }
                        >
                          {user.fullName}
                        </a>
                      ) : (
                        <div className='text-primary text-xs font-medium'>
                          {user.fullName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className='text-base-content/40 text-xs font-medium'>
                  Belum ada
                </span>
              )}
            </div>
          </div>

          {!isDesaType && (
            <div className={statClasses}>
              <div className='flex items-center gap-2'>
                <IconMapPin className='text-info h-4 w-4' />
                <span className='text-base-content/70 text-sm font-medium'>
                  {getSubRegionLabel()}:
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='text-info text-sm font-bold'>
                  {region.childRegionCount}
                </span>
              </div>
            </div>
          )}

          <div className={statClasses}>
            <div className='flex items-center gap-2'>
              <IconUsers className='text-success h-4 w-4' />
              <span className='text-base-content/70 text-sm font-medium'>
                Jumlah Sasaran:
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <span className='text-success text-sm font-bold'>
                {region.targetCount}
              </span>
            </div>
          </div>
        </div>

        {/* Footer with type badge and status indicator */}
        <div className='border-base-300/50 mt-4 border-t pt-3'>
          <div className='flex items-center justify-between'>
            <span className={badgeClasses}>
              <IconComponent className='h-3 w-3' />
              {region.type}
            </span>
            {isDisabled && (
              <span className='text-base-content/40 text-xs font-medium'>
                Tidak Aktif
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
