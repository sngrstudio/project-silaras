import { type FC, type PropsWithChildren, useEffect } from 'react'
import { Toast } from 'radix-ui'
import { useStore } from '@nanostores/react'
import { $showToast, $toastMessage } from './store'

const ToastWrapper: FC<PropsWithChildren> = ({ children }) => {
  const showToast = useStore($showToast)
  const toastMessage = useStore($toastMessage)

  useEffect(() => {
    $showToast.subscribe((show) => {
      if (!show) {
        $toastMessage.set(undefined)
      }
    })
  }, [showToast])

  return (
    <Toast.Provider duration={toastMessage?.error ? 5000 : 2500}>
      {children}

      {/* toast */}
      <Toast.Root
        className='alert [[data-error=false]]:alert-success [[data-error=true]]:alert-error max-w-[320px] p-4'
        open={showToast}
        onOpenChange={$showToast.set}
        data-error={toastMessage?.error}
      >
        <Toast.Description>{toastMessage?.message}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport className='fixed right-0 bottom-0 z-[9999] p-6'></Toast.Viewport>
    </Toast.Provider>
  )
}

export default ToastWrapper
