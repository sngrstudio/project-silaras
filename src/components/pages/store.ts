import { persistentAtom } from '@nanostores/persistent'
import { actions } from 'astro:actions'
import { computed } from 'nanostores'

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

export const $siteName = computed($settings, (settings) => {
  const name = settings
    ? settings.find((s) => s.property === 'SITE_NAME')?.value
    : ''
  return name
})
