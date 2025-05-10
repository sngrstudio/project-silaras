import { onMount, task } from 'nanostores'
import { $settings, setSettings } from '~/components/dashboard/store'
import { $toastMessage, setToastMessage } from '~/components/toast/store'
import { actions } from 'astro:actions'

onMount($settings, () => {
  task(async () => {
    const state = await actions.settings.get.orThrow()
    setSettings(state)
  })

  return () => {
    setSettings(undefined)
  }
})

onMount($toastMessage, () => {
  return () => {
    setToastMessage(undefined)
  }
})
