import { atom } from 'nanostores'
import { actions } from 'astro:actions'

export type Regions = Awaited<
  ReturnType<typeof actions.region.getAllWithCounts.orThrow>
>

export const $regions = atom<Regions | undefined>(undefined)
export const setRegions = (state: Regions | undefined) => $regions.set(state)
