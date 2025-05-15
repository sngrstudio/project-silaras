import { atom } from 'nanostores'
import { actions } from 'astro:actions'

type Regions = Awaited<ReturnType<typeof actions.region.get.orThrow>>
export type Region = Regions[number]

export const $regions = atom<Regions | undefined>(undefined)

export const setRegions = (state: Regions | undefined) => $regions.set(state)
