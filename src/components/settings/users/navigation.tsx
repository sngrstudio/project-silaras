import { type FC } from 'react'
import { useStore } from '@nanostores/react'
import { $users, $currentPage, setUsers, setCurrentPage } from './users.store'
import { actions } from 'astro:actions'
import PreviousIcon from '~icons/lucide/chevron-left'
import NextIcon from '~icons/lucide/chevron-right'

const Navigation: FC = () => {
  const users = useStore($users)
  const currentPage = useStore($currentPage)

  if (!users) {
    return <></>
  }

  const hasNextPage = users.users.length === 10 // Assuming 10 is the page size
  const hasPrevPage = currentPage > 1

  const handlePrevPage = async () => {
    if (!hasPrevPage) return

    const prevPage = currentPage - 1
    const prevUsers = await actions.user.getAll.orThrow({
      page: prevPage,
      size: 10
    })

    setUsers(prevUsers)
    setCurrentPage(prevPage)
  }

  const handleNextPage = async () => {
    if (!hasNextPage) return

    const nextPage = currentPage + 1
    const nextUsers = await actions.user.getAll.orThrow({
      page: nextPage,
      size: 10
    })

    setUsers(nextUsers)
    setCurrentPage(nextPage)
  }

  return (
    <div className='mt-8 flex justify-center'>
      <div className='border-base-300 bg-base-100 inline-flex items-center overflow-hidden rounded-full border shadow-lg'>
        <button
          className='hover:bg-primary hover:text-primary-content disabled:hover:text-base-content flex h-12 items-center justify-center px-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
          aria-label='halaman sebelumnya'
          onClick={handlePrevPage}
          disabled={!hasPrevPage}
        >
          <PreviousIcon className='h-5 w-5' />
        </button>

        <div className='border-base-300 from-primary/5 to-primary/10 text-base-content flex h-12 items-center border-x bg-gradient-to-r px-6 font-medium'>
          {`Halaman ${currentPage}`}
        </div>

        <button
          className='hover:bg-primary hover:text-primary-content disabled:hover:text-base-content flex h-12 items-center justify-center px-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
          aria-label='halaman selanjutnya'
          onClick={handleNextPage}
          disabled={!hasNextPage}
        >
          <NextIcon className='h-5 w-5' />
        </button>
      </div>
    </div>
  )
}

export default Navigation
