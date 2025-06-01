import { atom, computed } from 'nanostores'

export type ToastMessage =
  | {
      error?: boolean | undefined
      message: string | undefined
    }
  | undefined

// Store for the toast message
export const $toastMessage = atom<ToastMessage>(undefined)

// Computed store that returns true if toast message is defined
export const $isToastOpen = computed($toastMessage, (message) => {
  return message !== undefined && message.message !== undefined
})

// Helper functions to manage toast
export const showToast = (message: string, isError = false) => {
  $toastMessage.set({
    error: isError,
    message
  })
}

export const showErrorToast = (message: string) => {
  showToast(message, true)
}

export const showSuccessToast = (message: string) => {
  showToast(message, false)
}

export const hideToast = () => {
  $toastMessage.set(undefined)
}
