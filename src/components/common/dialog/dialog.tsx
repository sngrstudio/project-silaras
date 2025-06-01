import {
  useEffect,
  useRef,
  type DialogHTMLAttributes,
  type FC,
  type PropsWithChildren
} from 'react'
import { clsx } from 'clsx/lite'

// Export the new modal dialog as well
export { ModalDialog } from './modal-dialog'

export interface DialogTemplateProps
  extends DialogHTMLAttributes<HTMLDialogElement> {
  title?: string | undefined
  open: boolean
  closeAction?: () => void
}

/**
 * Dialog component using native <dialog> element
 *
 * Note: The native dialog element creates a "top layer" that appears above all other content
 * regardless of z-index values. This means toast notifications will appear behind the modal.
 *
 * For cases where you need toast notifications to appear above the modal,
 * use ModalDialog from './modal-dialog' instead.
 */

export const DialogTemplate: FC<PropsWithChildren<DialogTemplateProps>> = ({
  children,
  title,
  open = false,
  closeAction,
  className,
  ...props
}) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (ref.current) {
      if (open) {
        ref.current.showModal()
      } else {
        ref.current.close()
      }
    }
  }, [open])

  return (
    <dialog
      className={clsx('modal max-md:modal-bottom', className)}
      ref={ref}
      {...props}
    >
      <div className='modal-box md:max-h-[90vh] md:w-[75vh]'>
        {title && <h3 className='mb-4 text-lg font-bold'>{title}</h3>}
        {children}
      </div>
      <form className='modal-backdrop' method='dialog' onSubmit={closeAction}>
        <button>close</button>
      </form>
    </dialog>
  )
}
