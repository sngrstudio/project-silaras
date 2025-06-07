/**
 * @fileoverview Dialog Component with Radix UI Integration
 *
 * Modern modal dialog component built with Radix UI for enhanced accessibility,
 * proper focus management, and responsive design. Provides z-index layering
 * that allows toast notifications to appear above modals.
 *
 * Features:
 * - Radix UI foundation for accessibility compliance
 * - Responsive design with mobile bottom-sheet behavior
 * - Smooth animations and transitions
 * - Proper focus trap and keyboard navigation
 * - Portal rendering for z-index management
 * - Auto-close functionality
 *
 * @author SNGR Creative
 * @version 1.0.0
 */
import { Dialog } from 'radix-ui'
import { clsx } from 'clsx/lite'
import type { FC, PropsWithChildren } from 'react'
import IconX from '~icons/lucide/x'

/**
 * Props interface for the main Dialog component
 *
 * @interface DialogProps
 */
export interface DialogProps {
  /**
   * Optional title for the dialog header.
   * When provided, displays as a prominent heading.
   */
  title?: string | undefined

  /**
   * Optional description text for the dialog.
   * Provides additional context below the title.
   */
  description?: string | undefined

  /**
   * Controls the open/closed state of the dialog.
   * Must be managed by parent component.
   */
  open: boolean

  /**
   * Callback fired when the dialog's open state changes.
   * Used for controlled state management.
   */
  onOpenChange?: (open: boolean) => void

  /**
   * Optional callback fired when dialog is closed.
   * Useful for cleanup or state reset operations.
   */
  closeAction?: () => void

  /**
   * Additional CSS classes for dialog content styling.
   * Applied to the dialog content container.
   */
  className?: string

  /**
   * Optional trigger element to open the dialog.
   * When provided, renders as a clickable trigger.
   */
  trigger?: React.ReactNode
}

/**
 * Modern Dialog Component with Radix UI
 *
 * A comprehensive modal dialog component that provides excellent accessibility,
 * responsive design, and smooth animations. Built on Radix UI primitives for
 * robust focus management and keyboard navigation.
 *
 * Accessibility Features:
 * - Automatic focus management and trapping
 * - ARIA attributes for screen readers
 * - Keyboard navigation support (ESC to close, tab cycling)
 * - Portal rendering to prevent z-index conflicts
 *
 * Responsive Behavior:
 * - Desktop: Centered modal with backdrop
 * - Mobile: Bottom sheet with slide-up animation
 * - Adaptive sizing and positioning
 *
 * @component
 * @param props - Component properties
 * @param props.children - Content to render inside the dialog
 * @param props.title - Optional dialog title
 * @param props.description - Optional dialog description
 * @param props.open - Controls dialog visibility
 * @param props.onOpenChange - Callback for state changes
 * @param props.closeAction - Optional close callback
 * @param props.className - Additional styling classes
 * @param props.trigger - Optional trigger element
 *
 * @example
 * ```tsx
 * // Basic controlled dialog
 * <DialogComponent
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Confirmation"
 *   description="Are you sure you want to continue?"
 * >
 *   <div>Dialog content here</div>
 * </DialogComponent>
 *
 * // With trigger and close action
 * <DialogComponent
 *   open={showModal}
 *   onOpenChange={setShowModal}
 *   closeAction={handleClose}
 *   trigger={<button>Open Dialog</button>}
 * >
 *   <form onSubmit={handleSubmit}>...</form>
 * </DialogComponent>
 * ```
 *
 * @see {@link Dialog} - Radix UI Dialog primitives
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

// Export the main component as default
export default DialogComponent

// Also export with original name for compatibility
export { DialogComponent as RadixDialog }
