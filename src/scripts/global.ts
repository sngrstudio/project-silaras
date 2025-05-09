import { onMount } from 'nanostores'
import { $toastMessage, setToastMessage } from '~/components/toast/store'

onMount($toastMessage, () => {
  return () => {
    setToastMessage(undefined)
  }
})
