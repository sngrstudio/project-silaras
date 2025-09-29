/**
 * @fileoverview Pagination Component
 *
 * A reusable pagination component that provides navigation controls for paginated data.
 * Features responsive design with different layouts for desktop and mobile views.
 *
 * Features:
 * - Previous/Next navigation buttons
 * - Page number display and input
 * - Total items and pages information
 * - Responsive design with mobile-friendly layout
 * - Keyboard navigation support
 * - Customizable page size options
 *
 * @module Components/Common/Pagination
 * @author SNGR Creative
 * @since 1.0.0
 */

import { type FC } from 'react'
import clsx from 'clsx'
import ChevronLeftIcon from '~icons/lucide/chevron-left'
import ChevronRightIcon from '~icons/lucide/chevron-right'
import ChevronsLeftIcon from '~icons/lucide/chevrons-left'
import ChevronsRightIcon from '~icons/lucide/chevrons-right'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className
}) => {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(e.currentTarget.value)
      if (page >= 1 && page <= totalPages) {
        onPageChange(page)
      }
    }
  }

  if (totalCount === 0) {
    return null
  }

  return (
    <div
      className={clsx(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {/* Items info and page size selector */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
        <div className='text-base-content/70 text-sm'>
          Menampilkan {startItem}-{endItem} dari {totalCount} data
        </div>

        {onPageSizeChange && (
          <div className='flex items-center gap-2'>
            <span className='text-base-content/70 text-sm'>Per halaman:</span>
            <select
              className='select select-bordered select-sm w-20'
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className='flex items-center gap-2'>
        {/* First page button */}
        <button
          className={clsx('btn btn-sm btn-ghost', {
            'btn-disabled': !hasPreviousPage
          })}
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage}
          title='Halaman pertama'
        >
          <ChevronsLeftIcon className='h-4 w-4' />
        </button>

        {/* Previous page button */}
        <button
          className={clsx('btn btn-sm btn-ghost', {
            'btn-disabled': !hasPreviousPage
          })}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          title='Halaman sebelumnya'
        >
          <ChevronLeftIcon className='h-4 w-4' />
        </button>

        {/* Page input and info */}
        <div className='flex items-center gap-2'>
          <span className='text-base-content/70 text-sm'>Halaman</span>
          <input
            type='number'
            className='input input-bordered input-sm w-16 text-center'
            value={currentPage}
            min={1}
            max={totalPages}
            onChange={handlePageInput}
            onKeyDown={handleKeyDown}
          />
          <span className='text-base-content/70 text-sm'>
            dari {totalPages}
          </span>
        </div>

        {/* Next page button */}
        <button
          className={clsx('btn btn-sm btn-ghost', {
            'btn-disabled': !hasNextPage
          })}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          title='Halaman selanjutnya'
        >
          <ChevronRightIcon className='h-4 w-4' />
        </button>

        {/* Last page button */}
        <button
          className={clsx('btn btn-sm btn-ghost', {
            'btn-disabled': !hasNextPage
          })}
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          title='Halaman terakhir'
        >
          <ChevronsRightIcon className='h-4 w-4' />
        </button>
      </div>
    </div>
  )
}

export default Pagination
