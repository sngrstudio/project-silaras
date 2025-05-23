import { type FC } from 'react'
import { useStore } from '@nanostores/react'
import { $regions, setRegions } from './region.store'
import { actions } from 'astro:actions'
import PreviousIcon from '~icons/lucide/chevron-left'
import NextIcon from '~icons/lucide/chevron-right'

const Navigation: FC = () => {
  const regions = useStore($regions)

  if (!regions) {
    return <></>
  }

  const handlePrevPage = async () => {
    const prevPage = await actions.region.getAll.orThrow({
      parentId: '0196f800-ff2c-7000-a88b-570020a1feb8', // temporary
      page: regions.pageProps.page - 1
    })

    setRegions(prevPage)
  }

  const handleNextPage = async () => {
    const nextPage = await actions.region.getAll.orThrow({
      parentId: '0196f800-ff2c-7000-a88b-570020a1feb8', // temporary
      page: regions.pageProps.page + 1
    })

    setRegions(nextPage)
  }

  return (
    <div className='card-actions mt-8'>
      <div className='join w-full'>
        <button
          className='btn'
          aria-label='halaman sebelumnya'
          onClick={handlePrevPage}
          disabled={regions.pageProps.page <= 1}
        >
          <PreviousIcon />
        </button>
        <button className='btn max-md:flex-1' disabled>
          {`Halaman ${regions.pageProps.page} dari ${regions.pageProps.total}`}
        </button>
        <button
          className='btn'
          aria-label='halaman selanjutnya'
          onClick={handleNextPage}
          disabled={regions.pageProps.page >= regions.pageProps.total}
        >
          <NextIcon />
        </button>
      </div>
    </div>
  )
}

export default Navigation
