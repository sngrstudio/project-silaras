import { atom } from 'nanostores'
import { persistentAtom } from '@nanostores/persistent'
import { actions } from 'astro:actions'

export const $openDrawer = atom<boolean>(false)
export const setOpenDrawer = (state: boolean) => $openDrawer.set(state)

export type UserProfile = Awaited<ReturnType<typeof actions.user.get>>['data']
export const $userProfile = persistentAtom<UserProfile>('profile', undefined, {
  encode: (d) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(d)))),
  decode: (e) =>
    JSON.parse(
      new TextDecoder().decode(Uint8Array.from(atob(e), (c) => c.charCodeAt(0)))
    )
})
export const setUserProfile = (state: UserProfile) => $userProfile.set(state)
