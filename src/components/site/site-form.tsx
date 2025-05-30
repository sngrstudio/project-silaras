import { useActionState, useRef, type FC } from 'react'
import { useStore } from '@nanostores/react'
import { $siteSettings, setSiteSettings } from './site.store'
import { actions, isInputError } from 'astro:actions'

const SiteForm: FC = () => {
  const formRef = useRef<HTMLFormElement>(null)
  const siteSettings = useStore($siteSettings)

  const handleForm = async (_prev: unknown, formData: FormData) => {
    console.log(formData)
    const { error, data } = await actions.site.update(formData)

    if (error && !data) {
      if (isInputError(error)) {
        return error
      }
      console.error(error)
      return undefined
    }

    console.log(data)
    setSiteSettings(data)
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
          disabled={isPending}
        />
      </div>

      <div>
        <label className='label' htmlFor='siteLogo'>
          Site Logo
        </label>
        <input
          className='file-input md:file-input-lg file-input-ghost w-full'
          type='file'
          id='siteLogo'
          name='siteLogo'
          accept='image/*'
          disabled={isPending}
        />
        {siteSettings.SITE_LOGO && (
          <div>Current logo: {siteSettings.SITE_LOGO}</div>
        )}
      </div>

      <div className='flex w-full flex-col-reverse md:flex-row-reverse'>
        <button
          className='btn btn-primary max-md:w-full'
          type='submit'
          disabled={isPending}
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}

export default SiteForm
