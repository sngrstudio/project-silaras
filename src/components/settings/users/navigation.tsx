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

  const hasNextPage = users.length === 10 // Assuming 10 is the page size
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
    <div className='card-actions mt-8'>
      <div className='join w-full'>
        <button
          className='btn'
          aria-label='halaman sebelumnya'
          onClick={handlePrevPage}
          disabled={!hasPrevPage}
        >
          <PreviousIcon />
        </button>
        <div className='btn max-md:flex-1'>Halaman {currentPage}</div>
        <button
          className='btn'
          aria-label='halaman selanjutnya'
          onClick={handleNextPage}
          disabled={!hasNextPage}
        >
          <NextIcon />
        </button>
      </div>
    </div>
  )
}

export default Navigation
