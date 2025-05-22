import { atom } from 'nanostores'
import { actions } from 'astro:actions'

export type Regions = Awaited<ReturnType<typeof actions.region.getAll.orThrow>>

export const $regions = atom<Regions>([])
export const setRegions = (state: Regions) => $regions.set(state)
