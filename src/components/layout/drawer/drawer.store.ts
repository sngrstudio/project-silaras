import { atom } from 'nanostores'
import { actions } from 'astro:actions'

export const $openDrawer = atom<boolean>(false)
export const setOpenDrawer = (state: boolean) => $openDrawer.set(state)

type CurrentUser = Awaited<ReturnType<typeof actions.user.getCurrent.orThrow>>
export const $currentUser = atom<CurrentUser | undefined>(undefined)
export const setCurrentUser = (state: CurrentUser | undefined) =>
  $currentUser.set(state)
