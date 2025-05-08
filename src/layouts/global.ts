import { onMount, task } from 'nanostores'
import { $settings, setSettings } from '~/components/pages/stores/settings'
import {
  $users,
  $isOnlyAdmin,
  setUsers,
  setIsOnlyAdmin
} from '~/components/pages/stores/users'
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

onMount($users, () => {
  task(async () => {
    const initialUsers = await actions.user.getAll.orThrow()
    setUsers(initialUsers)
  })

  return () => {
    setUsers([])
  }
})

onMount($isOnlyAdmin, () => {
  task(async () => {
    const isOnlyAdmin = await actions.auth.isOnlyAdmin.orThrow()
    setIsOnlyAdmin(isOnlyAdmin)
  })

  return () => {
    setIsOnlyAdmin(undefined)
  }
})
