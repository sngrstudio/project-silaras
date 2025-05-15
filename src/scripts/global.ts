import { onMount, task } from 'nanostores'
import { $settings, setSettings } from '~/components/layout/dashboard/store'
import { $toastMessage, setToastMessage } from '~/components/layout/toast/store'
import { $user, setUser } from '~/components/pages/profile/store'
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

onMount($user, () => {
  task(async () => {
    const state = await actions.user.getCurrent.orThrow()
    console.log(state)
    setUser(state)
  })

  return () => {
    setUser(undefined)
  }
})
