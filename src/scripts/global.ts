import { onMount, task } from 'nanostores'
import {
  $settings,
  setSettings,
  $menu,
  setMenu,
  $openDrawer,
  setOpenDrawer
} from '~/components/dashboard/store'
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

onMount($menu, () => {
  task(async () => {
    const state = await actions.settings.menu.get.orThrow()
    setMenu(state)
  })

  return () => {
    setMenu(undefined)
  }
})

onMount($toastMessage, () => {
  return () => {
    setToastMessage(undefined)
  }
})

onMount($openDrawer, () => {
  return () => {
    setOpenDrawer(undefined)
  }
})
