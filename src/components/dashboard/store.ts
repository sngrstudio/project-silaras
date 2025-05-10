import { persistentAtom } from '@nanostores/persistent'
import { atom, computed } from 'nanostores'
import { actions } from 'astro:actions'

type Settings = Awaited<ReturnType<typeof actions.settings.get.orThrow>>

export const $settings = persistentAtom<Settings | undefined>(
  'settings',
  undefined,
  {
    encode: JSON.stringify,
    decode: JSON.parse
  }
)

export const setSettings = (state: Settings | undefined) => $settings.set(state)

export const $site = computed($settings, (settings) => {
  if (settings) {
    return {
      name: settings.find((s) => s.property === 'SITE_NAME')?.value ?? '',
      description:
        settings.find((s) => s.property === 'SITE_DESCRIPTION')?.value ?? ''
    }
  } else {
    return undefined
  }
})

export const $openDrawer = atom<boolean | undefined>(undefined)

export const setOpenDrawer = (state: boolean | undefined) =>
  $openDrawer.set(state)

type Menu = Awaited<ReturnType<typeof actions.settings.menu.get.orThrow>>

export const $menu = persistentAtom<Menu | undefined>('menu', undefined, {
  encode: JSON.stringify,
  decode: JSON.parse
})

export const setMenu = (state: Menu | undefined) => $menu.set(state)
