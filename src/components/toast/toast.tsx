import type { FC, PropsWithChildren } from 'react'
import { Toast } from 'radix-ui'
import { useStore } from '@nanostores/react'
import {
  $toastMessage,
  $showToast,
  setToastMessage
} from '~/components/toast/store'
import InfoIcon from '~icons/lucide/info'
import ErrorIcon from '~icons/lucide/circle-x'

const ToastRC: FC<PropsWithChildren> = ({ children }) => {
  const showToast = useStore($showToast)
  const toastMessage = useStore($toastMessage)

  const handleToastChange = () => {
    if (showToast) {
      setToastMessage(undefined)
    }
  }

  return (
    <Toast.Provider duration={3000}>
      {children}
      <Toast.Root
        className='alert data-[error=false]:alert-info data-[error=false]:alert-soft data-[error=true]:alert-error w-[320px] rounded-full px-4 py-2'
        open={showToast}
        onOpenChange={handleToastChange}
        data-error={toastMessage && toastMessage.error}
      >
        {toastMessage && toastMessage.error ? <ErrorIcon /> : <InfoIcon />}
        <Toast.Description>{toastMessage?.message}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport className='fixed bottom-0 left-[50%] z-[9999] translate-x-[-50%] pb-8'></Toast.Viewport>
    </Toast.Provider>
  )
}

export default ToastRC
