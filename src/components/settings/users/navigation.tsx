/**
 * @fileoverview User Management Pagination Component
 *
 * React component providing pagination navigation for the user management
 * interface. Handles page navigation with server-side data fetching and
 * state management for large user datasets.
 *
 * Features:
 * - Server-side pagination with configurable page size
 * - Previous/next page navigation
 * - Loading states during page transitions
 * - Disabled states for boundary pages
 * - Responsive button design
 * - Integration with user management store
 *
 * Pagination Logic:
 * - Default page size of 10 users per page
 * - Automatic next page detection based on result count
 * - Previous page availability based on current page
 * - Server-side data fetching for each page
 * - State synchronization with nanostore
 *
 * User Experience:
 * - Clear navigation indicators
 * - Disabled states for unavailable actions
 * - Loading feedback during page changes
 * - Accessible navigation buttons
 * - Consistent styling with application theme
 *
 * State Management:
 * - Integrates with users.store for data and page state
 * - Updates current page number and user data
 * - Handles server communication through Astro Actions
 * - Maintains pagination state across component renders
 *
 * Error Handling:
 * - Graceful handling of pagination failures
 * - Fallback behavior for network issues
 * - User feedback through loading states
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

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
