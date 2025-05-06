import { onMount, task } from 'nanostores'
import { $settings, setSettings } from '~/components/pages/store'
import { actions } from 'astro:actions'

onMount($settings, () => {
  task(async () => {
    const initialSettings = await actions.settings.get.orThrow()
    setSettings(initialSettings)
  })

  return () => {
    setSettings(undefined)
  }
})
