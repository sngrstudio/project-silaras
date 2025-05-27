import {
  useEffect,
  useRef,
  type DialogHTMLAttributes,
  type FC,
  type PropsWithChildren
} from 'react'
import { clsx } from 'clsx/lite'

export interface DialogTemplateProps
  extends DialogHTMLAttributes<HTMLDialogElement> {
  title?: string | undefined
  open: boolean
  closeAction?: () => void
}

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
