import { type FC } from 'react'
import { showToast, showErrorToast, showSuccessToast } from './toast.store'

/**
 * Example component demonstrating how to use the toast
 * This is just for reference - you can delete this file once you understand the usage
 */
const ToastExample: FC = () => {
  return (
    <div className='flex gap-2'>
      <button
        className='btn btn-success btn-sm'
        onClick={() => showSuccessToast('Operation completed successfully!')}
      >
        Show Success Toast
      </button>

      <button
        className='btn btn-error btn-sm'
        onClick={() => showErrorToast('An error occurred!')}
      >
        Show Error Toast
      </button>

      <button
        className='btn btn-neutral btn-sm'
        onClick={() => showToast('This is a neutral message')}
      >
        Show Neutral Toast
      </button>
    </div>
  )
}

export default ToastExample
