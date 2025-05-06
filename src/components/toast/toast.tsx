import { type FC, type PropsWithChildren, useEffect } from 'react'
import { Toast } from 'radix-ui'
import { useStore } from '@nanostores/react'
import {
  $showToast,
  $toastMessage,
  setShowToast,
  clearToastMessage
} from './store'

const ToastWrapper: FC<PropsWithChildren> = ({ children }) => {
  const showToast = useStore($showToast)
  const toastMessage = useStore($toastMessage)

  useEffect(() => {
    clearToastMessage()
  }, [showToast])

  return (
    <Toast.Provider duration={toastMessage?.error ? 5000 : 1500}>
      {children}

      {/* toast */}
      <Toast.Root
        className='alert data-[error=false]:alert-info data-[error=false]:alert-soft data-[error=true]:alert-error max-w-[320px] p-4'
        open={showToast}
        onOpenChange={setShowToast}
        data-error={toastMessage?.error}
      >
        <Toast.Description>{toastMessage?.message}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport className='fixed right-0 bottom-0 z-[9999] p-6'></Toast.Viewport>
    </Toast.Provider>
  )
}

export default ToastWrapper
