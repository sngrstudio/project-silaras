import { type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { type Regions } from './region.store'
import LinkIcon from '~icons/lucide/external-link'
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

  // Check if user can access this region
  const canAccess =
    userRegion && !loading
      ? canUserAccessRegionSync(currentUser, region, userRegion)
      : false

  return (
    <>
      <div className='list-col-grow flex flex-col justify-center'>
        {canAccess ? (
          <a className='link text-lg font-bold' href={path}>
            {name}
          </a>
        ) : (
          <span
            className='text-lg font-bold text-gray-500'
            title='Anda tidak memiliki akses ke wilayah ini'
          >
            {name}
          </span>
        )}
        <div className='mt-1'>
          <span className='badge badge-soft badge-neutral badge-sm'>
            {region.type}
          </span>
        </div>
      </div>
      <div>
        {canAccess ? (
          <a
            className='btn btn-ghost btn-square'
            href={path}
            aria-label={`buka halaman ${name}`}
          >
            <LinkIcon />
          </a>
        ) : (
          <button
            className='btn btn-ghost btn-square'
            disabled
            title='Anda tidak memiliki akses ke wilayah ini'
            aria-label={`Akses terbatas untuk ${name}`}
          >
            <LinkIcon />
          </button>
        )}
      </div>
    </>
  )
}

export default MobileList
