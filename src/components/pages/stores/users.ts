import { atom, computed } from 'nanostores'
import { actions } from 'astro:actions'

export type Users = Awaited<ReturnType<typeof actions.user.getAll.orThrow>>
export type User = Users[0]

export const $users = atom<Users>([])
export const setUsers = (state: Users) => $users.set(state)

export const $user = atom<User | undefined>(undefined)
export const setUser = (state: User | undefined) => $user.set(state)

export const $openUserDialog = computed($user, (user) => !!user)

export const $createMode = atom<boolean>(true)
export const setCreateMode = (state: boolean) => $createMode.set(state)

export const $isOnlyAdmin = atom<boolean | undefined>(undefined)
export const setIsOnlyAdmin = (state: boolean | undefined) =>
  $isOnlyAdmin.set(state)
