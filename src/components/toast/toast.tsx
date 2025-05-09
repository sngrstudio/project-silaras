import type { FC, PropsWithChildren } from 'react'
import { Toast } from 'radix-ui'
import { useStore } from '@nanostores/react'
import {
  $toastMessage,
  $showToast,
  setToastMessage
} from '~/components/toast/store'

const ToastRC: FC<PropsWithChildren> = ({ children }) => {
  const showToast = useStore($showToast)
  const toastMessage = useStore($toastMessage)

  const handleToastChange = () => {
    if (showToast) {
      setToastMessage(undefined)
    }
  }

  return (
    <Toast.Provider>
      {children}
      <Toast.Root
        className='alert data-[error=false]:alert-info data-[error=false]:alert-soft data-[error=true]:alert-error max-w-[320px] p-4'
        open={showToast}
        onOpenChange={handleToastChange}
        data-error={toastMessage?.error}
      >
        <Toast.Description>{toastMessage?.message}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport className='fixed right-0 bottom-0 z-[9999] p-6'></Toast.Viewport>
    </Toast.Provider>
  )
}

export default ToastRC
