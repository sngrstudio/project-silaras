/**
 * @fileoverview Mobile List Component for Subregions
 *
 * This component provides a mobile-optimized list view for displaying subregion data
 * within the SILARAS platform. It renders region information in a card-based layout
 * suitable for mobile devices with touch-friendly interactions.
 *
 * Key Features:
 * - Mobile-optimized card layout for region data
 * - Role-based access control for region actions
 * - Interactive region navigation and details
 * - Region statistics display (child regions, targets, users)
 * - Region type indicators with appropriate icons
 *
 * Display Elements:
 * - Region name and type with visual indicators
 * - Child region and target count badges
 * - User count and management information
 * - External link navigation for detailed views
 *
 * @module Components/Region/Subregion
 * @author SNGR Creative
 * @since 1.0.0
 */
// filepath: /workspaces/project-dashat/src/components/region/subregion/mobile-list.tsx

import { type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { type Regions } from './region.store'
import LinkIcon from '~icons/lucide/external-link'
import IconBuilding from '~icons/lucide/building'
import IconMapPin from '~icons/lucide/map-pin'
import IconUsers from '~icons/lucide/users'
import IconTrendingUp from '~icons/lucide/trending-up'
import { canUserAccessRegionSync } from '../../../utils/access-control'
import { actions } from 'astro:actions'

interface MobileListProps {
  cell: CellContext<Regions['data'][number], unknown>
  currentUser?: Awaited<ReturnType<typeof actions.user.getCurrent.orThrow>>
  userRegion?: {
    id: string
    name: string
    slug: string
    type: 'KABUPATEN' | 'KECAMATAN' | 'DESA'
    parentId?: string | null
  } | null
  loading?: boolean
}

const MobileList: FC<MobileListProps> = ({
  cell,
  currentUser,
  userRegion,
  loading = false
}) => {
  const region = cell.row.original
  const name = region.name
  const path = `/region/${region.slug}`
  const isDesaType = region.type === 'DESA'

  // Check if user can access this region
  const canAccess =
    userRegion && !loading
      ? canUserAccessRegionSync(currentUser, region, userRegion)
      : false

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
        return 'badge-primary bg-primary/20 text-primary border-primary/30'
      case 'KECAMATAN':
        return 'badge-info bg-info/20 text-info border-info/30'
      case 'DESA':
        return 'badge-success bg-success/20 text-success border-success/30'
      default:
        return 'badge-neutral bg-neutral/20 text-neutral border-neutral/30'
    }
  }

  const IconComponent = getTypeIcon()

  return (
    <div className='card bg-base-100 border-base-300 hover:border-primary/30 border shadow-md transition-all duration-300 hover:shadow-lg'>
      <div className='card-body p-4'>
        {/* Header with icon and type */}
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg border ${getTypeColor()}`}
            >
              <IconComponent className='h-5 w-5' />
            </div>
            <div>
              {canAccess ? (
                <a
                  className='link text-base-content hover:text-primary text-lg font-bold transition-colors duration-200'
                  href={path}
                >
                  {name}
                </a>
              ) : (
                <span
                  className='text-base-content/50 text-lg font-bold'
                  title='Anda tidak memiliki akses ke wilayah ini'
                >
                  {name}
                </span>
              )}
              <div className='mt-1'>
                <span
                  className={`badge badge-sm rounded-full font-medium ${getTypeColor()}`}
                >
                  <IconComponent className='mr-1 h-3 w-3' />
                  {region.type}
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className='flex-shrink-0'>
            {canAccess ? (
              <a
                className='btn btn-ghost btn-sm btn-circle hover:bg-primary hover:text-primary-content transition-all duration-200 hover:scale-105'
                href={path}
                aria-label={`buka halaman ${name}`}
              >
                <LinkIcon className='h-4 w-4' />
              </a>
            ) : (
              <button
                className='btn btn-ghost btn-sm btn-circle opacity-50'
                disabled
                title='Anda tidak memiliki akses ke wilayah ini'
                aria-label={`Akses terbatas untuk ${name}`}
              >
                <LinkIcon className='h-4 w-4' />
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className='space-y-2'>
          {!isDesaType && (
            <div className='bg-base-200/50 hover:bg-base-200 flex items-center justify-between rounded-lg p-2 transition-all duration-200'>
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
                <IconTrendingUp className='text-info h-3 w-3' />
              </div>
            </div>
          )}

          <div className='bg-base-200/50 hover:bg-base-200 flex items-center justify-between rounded-lg p-2 transition-all duration-200'>
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
              <IconTrendingUp className='text-success h-3 w-3' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileList
