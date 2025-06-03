import { atom, computed } from 'nanostores'
import { actions } from 'astro:actions'

export type Targets = Awaited<ReturnType<typeof actions.target.getAll.orThrow>>

export const $targets = atom<Targets | undefined>(undefined)
export const setTargets = (state: Targets | undefined) => $targets.set(state)

export type Target = Omit<Targets[number], 'slug' | 'age' | 'initialBMI'>

export const $currentTarget = atom<Target | undefined>(undefined)
export const setCurrentTarget = (state: Target | undefined) =>
  $currentTarget.set(state)

export const $openTargetModal = computed($currentTarget, (current) => !!current)

export type CurrentRegion = NonNullable<
  Awaited<ReturnType<typeof actions.region.getBySlug.orThrow>>
>

export const $currentRegion = atom<CurrentRegion | undefined>(undefined)
export const setCurrentRegion = (state: CurrentRegion | undefined) =>
  $currentRegion.set(state)
