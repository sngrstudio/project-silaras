import { persistentAtom } from '@nanostores/persistent'
import { atom } from 'nanostores'
import { actions } from 'astro:actions'

type User = Awaited<ReturnType<typeof actions.user.getCurrentUser.orThrow>>

export const $user = persistentAtom<User | undefined>('user', undefined, {
  encode: JSON.stringify,
  decode: JSON.parse
})

export const setUser = (state: User | undefined) => $user.set(state)

type AccessLevels = Awaited<
  ReturnType<typeof actions.user.accessLevels.get.orThrow>
>

export const $accessLevels = atom<AccessLevels | undefined>(undefined)

export const setAccessLevels = (state: AccessLevels | undefined) =>
  $accessLevels.set(state)
