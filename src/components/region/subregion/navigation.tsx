import { type FC } from 'react'
import { useStore } from '@nanostores/react'
import { $regions, setRegions } from './region.store'
import { actions } from 'astro:actions'
import PreviousIcon from '~icons/lucide/chevron-left'
import NextIcon from '~icons/lucide/chevron-right'

const Navigation: FC = () => {
  const regions = useStore($regions)
  const parentSlug =
    window.location.pathname.split('/').at(-1) ?? 'kotawaringin-timur-6202'

  if (!regions) {
    return <></>
  }

  const handlePrevPage = async () => {
    const prevPage = await actions.region.getAllWithCounts.orThrow({
      parentSlug,
      page: regions.pageProps.page - 1
    })

    setRegions(prevPage)
  }

  const handleNextPage = async () => {
    const nextPage = await actions.region.getAllWithCounts.orThrow({
      parentSlug,
      page: regions.pageProps.page + 1
    })

    setRegions(nextPage)
  }

  return (
    <div className='mt-8 flex justify-center'>
      <div className='border-base-300 bg-base-100 inline-flex items-center overflow-hidden rounded-full border shadow-lg'>
        <button
          className='hover:bg-primary hover:text-primary-content disabled:hover:text-base-content flex h-12 items-center justify-center px-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
          aria-label='halaman sebelumnya'
          onClick={handlePrevPage}
          disabled={regions.pageProps.page <= 1}
        >
          <PreviousIcon className='h-5 w-5' />
        </button>

        <div className='border-base-300 from-primary/5 to-primary/10 text-base-content flex h-12 items-center border-x bg-gradient-to-r px-6 font-medium'>
          {`Halaman ${regions.pageProps.page} dari ${regions.pageProps.total}`}
        </div>

        <button
          className='hover:bg-primary hover:text-primary-content disabled:hover:text-base-content flex h-12 items-center justify-center px-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
          aria-label='halaman selanjutnya'
          onClick={handleNextPage}
          disabled={regions.pageProps.page >= regions.pageProps.total}
        >
          <NextIcon className='h-5 w-5' />
        </button>
      </div>
    </div>
  )
}

export default Navigation
