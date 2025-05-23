import { type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { type Regions } from './region.store'
import LinkIcon from '~icons/lucide/external-link'

interface MobileListProps {
  cell: CellContext<Regions['data'][number], unknown>
}

const MobileList: FC<MobileListProps> = ({ cell }) => {
  const name = cell.row.original.name
  const path = `/region/${cell.row.original.slug}`

  return (
    <>
      <div className='list-col-grow flex flex-col justify-center'>
        <a className='link text-lg font-bold' href={path}>
          {name}
        </a>
      </div>
      <div>
        <a
          className='btn btn-ghost btn-square'
          href={path}
          aria-label={`buka halaman ${name}`}
        >
          <LinkIcon />
        </a>
      </div>
    </>
  )
}

export default MobileList
