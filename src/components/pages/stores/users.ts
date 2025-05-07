import { atom } from 'nanostores'
import { actions } from 'astro:actions'

export type Users = Awaited<ReturnType<typeof actions.user.getAll.orThrow>>
export type User = Users[0]

export const $users = atom<Users>([])
export const setUsers = (state: Users) => $users.set(state)
