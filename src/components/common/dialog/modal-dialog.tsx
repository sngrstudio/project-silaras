import {
  useEffect,
  type FC,
  type PropsWithChildren,
  type MouseEvent
} from 'react'
import { clsx } from 'clsx/lite'

export interface ModalDialogProps {
  title?: string | undefined
  open: boolean
  closeAction?: () => void
  className?: string
}

/**
 * Alternative dialog implementation using div-based modal that respects z-index
 * This component provides the same functionality as DialogTemplate but with proper z-index support
 * for toast notifications to appear above modals.
 */
export const ModalDialog: FC<PropsWithChildren<ModalDialogProps>> = ({
  children,
  title,
  open = false,
  closeAction,
  className
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && closeAction) {
        closeAction()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, closeAction])

  // Handle backdrop click
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeAction) {
      closeAction()
    }
  }

  if (!open) {
    return null
  }

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[9998] flex items-center justify-center',
        'max-md:items-end', // Bottom positioning on mobile like DaisyUI modal-bottom
        className
      )}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' />

      {/* Modal content */}
      <div
        className={clsx(
          'bg-base-100 border-base-300 relative rounded-2xl border shadow-xl',
          'mx-4 max-h-[90vh] w-full max-w-[75vh] overflow-y-auto',
          'max-md:max-h-[85vh] max-md:rounded-b-none', // Mobile bottom modal styling
          'animate-in fade-in-0 zoom-in-95 duration-200',
          'max-md:slide-in-from-bottom-8'
        )}
      >
        <div className='p-6'>
          {title && <h3 className='mb-4 text-lg font-bold'>{title}</h3>}
          {children}
        </div>
      </div>
    </div>
  )
}
