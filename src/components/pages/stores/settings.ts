import { persistentAtom } from '@nanostores/persistent'
import { actions } from 'astro:actions'
import { computed } from 'nanostores'

type Settings = Awaited<ReturnType<typeof actions.settings.get.orThrow>>

export const $settings = persistentAtom<Settings | undefined>(
  'settings',
  undefined,
  {
    encode: (d) =>
      btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(d)))),
    decode: (e) =>
      JSON.parse(
        new TextDecoder().decode(
          Uint8Array.from(atob(e), (c) => c.charCodeAt(0))
        )
      )
  }
)

export const setSettings = (state: Settings | undefined) => $settings.set(state)

export const $siteName = computed($settings, (settings) => {
  const name = settings
    ? settings.find((s) => s.property === 'SITE_NAME')?.value
    : ''
  return name
})
