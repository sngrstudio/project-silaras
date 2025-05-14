import { atom, computed } from 'nanostores'
import { actions } from 'astro:actions'

type AllUser = Awaited<ReturnType<typeof actions.user.getAll.orThrow>>
export type User = AllUser[number]

export const $allUser = atom<AllUser | undefined>(undefined)

export const setAllUser = (state: AllUser | undefined) => $allUser.set(state)

export const $user = atom<User | undefined>(undefined)

export const setUser = (state: User | undefined) => $user.set(state)

export const $openDialog = computed($user, (user) => !!user)

export const $createMode = atom<boolean | undefined>(undefined)

export const setCreateMode = (state: boolean | undefined) =>
  $createMode.set(state)
