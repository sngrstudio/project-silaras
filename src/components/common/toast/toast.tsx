import { type FC, type ReactNode } from 'react'
import * as Toast from '@radix-ui/react-toast'
import { useStore } from '@nanostores/react'
import { $toastMessage, $isToastOpen, hideToast } from './toast.store'
import IconLucideAlertCircle from '~icons/lucide/alert-circle'
import IconLucideCheckCircle from '~icons/lucide/check-circle'
import IconLucideX from '~icons/lucide/x'

interface ToastComponentProps {
  children: ReactNode
}

/**
 * Toast Component using Radix UI
 *
 * Features:
 * - Appears from bottom-center with 320px width
 * - Pill-shaped design following DaisyUI alert styling
 * - Auto-dismisses after 5 seconds (handled by Toast.Provider duration)
 * - Can be manually dismissed by clicking the close button
 * - Supports error and success states with appropriate icons
 * - Smooth transitions with opacity and transform
 *
 * Usage:
 * 1. Import the toast functions: import { showToast, showErrorToast, showSuccessToast } from '~/components/common/toast/toast.store'
 * 2. Call the functions anywhere in your component:
 *    - showSuccessToast('Operation completed!')
 *    - showErrorToast('Something went wrong!')
 *    - showToast('Neutral message')
 *
 * The Toast component is automatically included in _dashboard.astro and user/_layout.astro layouts.
 */
const ToastComponent: FC<ToastComponentProps> = ({ children }) => {
  const toastMessage = useStore($toastMessage)
  const isOpen = useStore($isToastOpen)

  return (
    <Toast.Provider swipeDirection='up' duration={5000}>
      {children}
      <Toast.Root
        className={`fixed bottom-6 left-1/2 z-[9999] flex w-80 -translate-x-1/2 transform items-center gap-3 rounded-full border px-4 py-3 shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'} ${
          toastMessage?.error
            ? 'bg-error text-error-content border-error/20'
            : 'bg-success text-success-content border-success/20'
        } `}
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            hideToast()
          }
        }}
      >
        {/* Icon */}
        <div className='flex-shrink-0'>
          {toastMessage?.error ? (
            <IconLucideAlertCircle className='h-5 w-5' />
          ) : (
            <IconLucideCheckCircle className='h-5 w-5' />
          )}
        </div>

        {/* Message */}
        <Toast.Description className='flex-1 text-sm leading-tight font-medium'>
          {toastMessage?.message}
        </Toast.Description>

        {/* Close button */}
        <Toast.Close className='flex-shrink-0 rounded-full p-1 transition-colors duration-200 hover:bg-black/10'>
          <IconLucideX className='h-4 w-4' />
        </Toast.Close>
      </Toast.Root>

      <Toast.Viewport />
    </Toast.Provider>
  )
}

export default ToastComponent
