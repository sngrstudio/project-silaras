import { atom, effect } from 'nanostores'

export const $showToast = atom<boolean>(false)

export const setShowToast = (state: boolean) => $showToast.set(state)

export type ToastMessage = { error?: boolean | undefined; message: string }
export const $toastMessage = atom<ToastMessage | undefined>(undefined)

export const setToastMessage = (state: ToastMessage | undefined) =>
  $toastMessage.set(state)

export const clearToastMessage = effect(
  [$showToast, $toastMessage],
  (showToast, _toastMessage) => {
    if (!showToast) {
      setToastMessage(undefined)
    }
  }
)

export const setToastOn = (message: ToastMessage) => {
  setShowToast(true)
  setToastMessage(message)
}
