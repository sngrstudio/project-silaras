import { atom } from 'nanostores'
import { actions } from 'astro:actions'

export type DailyAssesments = Awaited<
  ReturnType<typeof actions.assesment.daily.getAll.orThrow>
>

export const $dailyAssesments = atom<DailyAssesments>([])
export const setDailyAssesments = (state: DailyAssesments) =>
  $dailyAssesments.set(state)

export type MonthlyAssesment = Awaited<
  ReturnType<typeof actions.assesment.monthly.get.orThrow>
>

export const $monthlyAssesments = atom<MonthlyAssesment | undefined>(undefined)
export const setMonthlyAssesment = (state: MonthlyAssesment | undefined) =>
  $monthlyAssesments.set(state)

export const $currentMonthIndex = atom<number>(6)
export const setCurrentMonthIndex = (state: number) =>
  $currentMonthIndex.set(state)
