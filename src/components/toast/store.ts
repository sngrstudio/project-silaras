import { atom } from 'nanostores'

export const $showToast = atom<boolean>(false)
export const $toastMessage = atom<
  { error: boolean; message: string } | undefined
>(undefined)
