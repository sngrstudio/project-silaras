import { persistentAtom } from '@nanostores/persistent'
import { actions } from 'astro:actions'

export type User = Awaited<ReturnType<typeof actions.user.get.orThrow>>

export const $user = persistentAtom<User | undefined>('user', undefined, {
  encode: JSON.stringify,
  decode: JSON.parse
})

export const setUser = (state: User | undefined) => $user.set(state)
