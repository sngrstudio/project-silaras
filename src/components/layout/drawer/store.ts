import { atom } from 'nanostores'

export const $openDrawer = atom<boolean>(false)
export const setOpenDrawer = (state: boolean) => $openDrawer.set(state)
