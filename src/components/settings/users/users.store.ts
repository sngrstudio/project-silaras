import { atom } from 'nanostores'
import { actions } from 'astro:actions'

export type Users = Awaited<ReturnType<typeof actions.user.getAll.orThrow>>

export const $users = atom<Users | undefined>(undefined)
export const setUsers = (state: Users | undefined) => $users.set(state)

export type User = Users[number]

export const $currentUser = atom<User | undefined>(undefined)
export const setCurrentUser = (state: User | undefined) =>
  $currentUser.set(state)

export const $currentPage = atom<number>(1)
export const setCurrentPage = (page: number) => $currentPage.set(page)
