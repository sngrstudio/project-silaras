import { atom } from 'nanostores'
import { actions } from 'astro:actions'

export type SiteSettings = Awaited<
  ReturnType<typeof actions.site.getAll.orThrow>
>

export const $siteSettings = atom<SiteSettings | undefined>(undefined)
export const setSiteSettings = (state: SiteSettings | undefined) =>
  $siteSettings.set(state)
