import { atom, computed } from 'nanostores'

type ToastMessage = {
  error?: boolean | undefined
  message: string
}
export const $toastMessage = atom<ToastMessage | undefined>(undefined)
export const setToastMessage = (state: ToastMessage | undefined) =>
  $toastMessage.set(state)

export const $showToast = computed($toastMessage, (state) => !!state)
