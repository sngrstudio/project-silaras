import { useActionState, useRef, useState, useEffect, type FC } from 'react'
import { useStore } from '@nanostores/react'
import { $siteSettings, setSiteSettings } from './site.store'
import { actions, isInputError } from 'astro:actions'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'

const SiteForm: FC = () => {
  const formRef = useRef<HTMLFormElement>(null)
  const siteSettings = useStore($siteSettings)
  const [formValues, setFormValues] = useState({
    siteName: '',
    siteDescription: ''
  })
  const [initialValues, setInitialValues] = useState({
    siteName: '',
    siteDescription: ''
  })

  useEffect(() => {
    if (siteSettings) {
      const values = {
        siteName: siteSettings.SITE_NAME,
        siteDescription: siteSettings.SITE_DESCRIPTION
      }
      setFormValues(values)
      setInitialValues(values)
    }
  }, [siteSettings])

  const hasChanges = () => {
    return (
      formValues.siteName !== initialValues.siteName ||
      formValues.siteDescription !== initialValues.siteDescription
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    if (formRef.current) {
      formRef.current.reset()
      setFormValues(initialValues)
    }
  }

  const handleForm = async (_prev: unknown, formData: FormData) => {
    const { error, data } = await actions.site.update(formData)

    if (error && !data) {
      if (isInputError(error)) {
        return error
      }
      showErrorToast('Terjadi kesalahan saat menyimpan pengaturan situs.')
      return undefined
    }

    setSiteSettings(data)
    showSuccessToast('Pengaturan situs berhasil disimpan!')
    setTimeout(() => window.location.reload(), 1000) // Small delay to show toast
    return undefined
  }

  const [_error, action, isPending] = useActionState(handleForm, undefined)

  if (!siteSettings) {
    return <></>
  }

  return (
    <form
      className='flex w-full flex-col gap-y-4'
      action={action}
      ref={formRef}
    >
      <div>
        <label className='label' htmlFor='siteName'>
          Site Name
        </label>
        <input
          className='input md:input-lg w-full'
          type='text'
          id='siteName'
          name='siteName'
          defaultValue={siteSettings.SITE_NAME}
          onChange={(e) => handleInputChange('siteName', e.target.value)}
          required
          disabled={isPending}
        />
      </div>

      <div>
        <label className='label' htmlFor='siteDescription'>
          Site Description
        </label>
        <input
          className='input md:input-lg w-full'
          type='text'
          id='siteDescription'
          name='siteDescription'
          defaultValue={siteSettings.SITE_DESCRIPTION}
          onChange={(e) => handleInputChange('siteDescription', e.target.value)}
          required
          disabled={isPending}
        />
      </div>

      <div className='flex w-full flex-col-reverse gap-2 md:flex-row-reverse'>
        <button
          className='btn btn-primary max-md:w-full'
          type='submit'
          disabled={isPending || !hasChanges()}
        >
          Save Changes
        </button>
        <button
          className='btn btn-ghost max-md:w-full'
          type='button'
          onClick={handleReset}
          disabled={isPending || !hasChanges()}
        >
          Reset
        </button>
      </div>
    </form>
  )
}

export default SiteForm
