import { useActionState, useRef, useState, useEffect, type FC } from 'react'
import { useStore } from '@nanostores/react'
import { $siteSettings, setSiteSettings } from './site.store'
import { actions, isInputError } from 'astro:actions'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'
import SettingsIcon from '~icons/lucide/settings'
import SaveIcon from '~icons/lucide/save'
import RotateCcwIcon from '~icons/lucide/rotate-ccw'
import GlobeIcon from '~icons/lucide/globe'
import FileTextIcon from '~icons/lucide/file-text'

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

  const [error, action, isPending] = useActionState(handleForm, undefined)

  if (!siteSettings) {
    return (
      <div className='flex items-center justify-center p-8'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6 p-6 md:p-8'>
      <div className='mb-2'>
        <h1 className='text-base-content text-2xl font-bold md:text-3xl'>
          Setelan Situs
        </h1>
        <p className='text-base-content/70 mt-1 text-sm'>
          Kelola pengaturan dasar situs dan informasi umum
        </p>
      </div>

      <form ref={formRef} action={action} className='flex flex-col gap-6'>
        {/* Site Configuration Section */}
        <fieldset className='border-primary/20 from-primary/5 to-primary/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
          <legend className='border-primary/30 bg-base-100 text-primary flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
            <SettingsIcon className='h-5 w-5' />
            Konfigurasi Situs
          </legend>

          <div className='grid gap-4'>
            {/* Site Name */}
            <div className='space-y-1'>
              <label
                className='label-text flex items-center gap-2 text-sm font-medium'
                htmlFor='siteName'
              >
                <GlobeIcon className='text-base-content/60 h-4 w-4' />
                Nama Situs
              </label>
              <input
                className='input input-bordered w-full'
                type='text'
                id='siteName'
                name='siteName'
                defaultValue={siteSettings.SITE_NAME}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                required
                disabled={isPending}
                placeholder='Masukkan nama situs'
              />
              {error?.fields?.siteName && (
                <div className='text-error text-xs'>
                  {error.fields.siteName.join(', ')}
                </div>
              )}
            </div>

            {/* Site Description */}
            <div className='space-y-1'>
              <label
                className='label-text flex items-center gap-2 text-sm font-medium'
                htmlFor='siteDescription'
              >
                <FileTextIcon className='text-base-content/60 h-4 w-4' />
                Deskripsi Situs
              </label>
              <textarea
                className='textarea textarea-bordered w-full resize-none'
                rows={3}
                id='siteDescription'
                name='siteDescription'
                defaultValue={siteSettings.SITE_DESCRIPTION}
                onChange={(e) =>
                  handleInputChange('siteDescription', e.target.value)
                }
                required
                disabled={isPending}
                placeholder='Masukkan deskripsi situs'
              />
              {error?.fields?.siteDescription && (
                <div className='text-error text-xs'>
                  {error.fields.siteDescription.join(', ')}
                </div>
              )}
              <div className='text-base-content/60 text-xs'>
                Deskripsi akan ditampilkan pada meta tag halaman
              </div>
            </div>
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className='border-base-300 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end'>
          <button
            type='button'
            className='btn btn-ghost'
            onClick={handleReset}
            disabled={isPending || !hasChanges()}
          >
            <RotateCcwIcon className='h-4 w-4' />
            Reset
          </button>

          <button
            type='submit'
            className='btn btn-primary'
            disabled={isPending || !hasChanges()}
          >
            {isPending && (
              <span className='loading loading-spinner loading-sm'></span>
            )}
            <SaveIcon className='h-4 w-4' />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  )
}

export default SiteForm
