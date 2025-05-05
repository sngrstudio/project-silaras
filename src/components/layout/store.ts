import { atom } from 'nanostores'
import { persistentAtom } from '@nanostores/persistent'
import { actions } from 'astro:actions'

export const $openDrawer = atom<boolean>(false)
export const $userProfile = persistentAtom<UserProfile>(
  'profile',
  {
    fullName: '',
    userName: '',
    role: 'USER'
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse
  }
)

export type UserProfile = NonNullable<
  Awaited<ReturnType<typeof actions.user.get>>['data']
>
