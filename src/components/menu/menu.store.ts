import { atom } from 'nanostores'
import { actions } from 'astro:actions'

export type DailyAssesmentsSettings = Awaited<
  ReturnType<typeof actions.assesment.settings.getAllDaily.orThrow>
>

export const $dailyAssesmentsSettings = atom<DailyAssesmentsSettings>([])
export const setDailyAssesmentsSettings = (state: DailyAssesmentsSettings) =>
  $dailyAssesmentsSettings.set(state)

export const $currentMonthIndex = atom<number>(6)
export const setCurrentMonthIndex = (state: number) =>
  $currentMonthIndex.set(state)
