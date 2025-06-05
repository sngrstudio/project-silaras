import { Dialog } from 'radix-ui'
import { clsx } from 'clsx/lite'
import type { FC, PropsWithChildren } from 'react'
import IconX from '~icons/lucide/x'

export interface DialogProps {
  title?: string | undefined
  description?: string | undefined
  open: boolean
  onOpenChange?: (open: boolean) => void
  closeAction?: () => void
  className?: string
  trigger?: React.ReactNode
}

// Legacy interface for backward compatibility
export interface DialogTemplateProps {
  children: React.ReactNode
}

/**
 * Radix UI Dialog component with proper z-index layering
 * This component allows toast notifications to appear above modals
 * and provides better accessibility than native dialog elements.
 */
export const DialogComponent: FC<PropsWithChildren<DialogProps>> = ({
  children,
  title,
  description,
  open = false,
  onOpenChange,
  closeAction,
  className,
  trigger
}) => {
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
    if (!newOpen && closeAction) {
      closeAction()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <Dialog.Portal>
        <Dialog.Overlay
          className={clsx(
            'fixed inset-0 bg-black/50 backdrop-blur-sm',
            'z-[9998]', // Below toast notifications (z-[9999]) but above other content
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />

        <Dialog.Content
          className={clsx(
            'fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
            'z-[9998]', // Same z-index as overlay, below toast notifications
            'bg-base-100 border-base-300 rounded-2xl border shadow-xl',
            'max-h-[90vh] w-full max-w-[75vh] overflow-y-auto',
            'max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:translate-x-0 max-md:translate-y-0',
            'max-md:max-h-[85vh] max-md:w-full max-md:rounded-b-none', // Mobile bottom modal styling
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'max-md:data-[state=closed]:slide-out-to-bottom-8 max-md:data-[state=open]:slide-in-from-bottom-8',
            className
          )}
        >
          <div className='p-6'>
            {title && (
              <Dialog.Title className='mb-4 text-lg font-bold'>
                {title}
              </Dialog.Title>
            )}
            {description && (
              <Dialog.Description className='text-base-content/70 mb-4 text-sm'>
                {description}
              </Dialog.Description>
            )}
            {children}
          </div>

          {/* Close button - accessible by screen readers */}
          <Dialog.Close asChild>
            <button
              className='btn btn-ghost ring-offset-base-100 focus:ring-primary absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none'
              aria-label='Close dialog'
            >
              <IconX />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Legacy DialogTemplate component for backward compatibility
export const DialogTemplate: FC<DialogTemplateProps> = ({ children }) => {
  return <div className='dialog-template'>{children}</div>
}

// Export the main component as default
export default DialogComponent

// Also export with original name for compatibility
export { DialogComponent as RadixDialog }
