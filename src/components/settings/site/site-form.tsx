import { useActionState, useRef, useState, useEffect, type FC } from 'react'
import { useStore } from '@nanostores/react'
import { $siteSettings, setSiteSettings } from './site.store'
import { actions, isInputError } from 'astro:actions'
import Image from '~/components/common/image/image'
import type { GetImageResult } from 'astro'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'

const SiteForm: FC = () => {
  const formRef = useRef<HTMLFormElement>(null)
  const siteSettings = useStore($siteSettings)
  const [siteLogo, setSiteLogo] = useState<GetImageResult | undefined>(
    undefined
  )
  const [formValues, setFormValues] = useState({
    siteName: '',
    siteDescription: '',
    siteLogo: null as File | null
  })
  const [initialValues, setInitialValues] = useState({
    siteName: '',
    siteDescription: '',
    siteLogo: null as File | null
  })

  useEffect(() => {
    if (siteSettings && siteSettings.SITE_LOGO) {
      actions.image.getPresignedImage
        .orThrow({ fileName: siteSettings.SITE_LOGO, height: 50, width: 50 })
        .then((image) => setSiteLogo(image))
    }
  }, [siteSettings?.SITE_LOGO])

  useEffect(() => {
    if (siteSettings) {
      const values = {
        siteName: siteSettings.SITE_NAME,
        siteDescription: siteSettings.SITE_DESCRIPTION,
        siteLogo: null
      }
      setFormValues(values)
      setInitialValues(values)
    }
  }, [siteSettings])

  const hasChanges = () => {
    return (
      formValues.siteName !== initialValues.siteName ||
      formValues.siteDescription !== initialValues.siteDescription ||
      formValues.siteLogo !== null
    )
  }

  const handleInputChange = (field: string, value: string | File | null) => {
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

      <div>
        <label className='label' htmlFor='siteLogo'>
          Site Logo
        </label>
        <div className='flex flex-col md:flex-row md:items-center md:gap-4'>
          {siteLogo && (
            <div className='mb-4 flex justify-center md:mb-0 md:justify-start'>
              <Image
                image={siteLogo}
                className='h-20 w-20 rounded-lg border-2 border-gray-200 object-cover'
                alt='Current site logo'
              />
            </div>
          )}
          <input
            className='file-input md:file-input-lg file-input-ghost w-full md:flex-1'
            type='file'
            id='siteLogo'
            name='siteLogo'
            accept='image/*'
            onChange={(e) =>
              handleInputChange('siteLogo', e.target.files?.[0] || null)
            }
            disabled={isPending}
          />
        </div>
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
