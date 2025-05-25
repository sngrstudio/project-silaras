import { atom } from 'nanostores'
import { actions } from 'astro:actions'

export type DailyAssesments = Awaited<
  ReturnType<typeof actions.assesment.daily.getAll.orThrow>
>

export const $dailyAssesments = atom<DailyAssesments>([])
export const setDailyAssesments = (state: DailyAssesments) =>
  $dailyAssesments.set(state)
