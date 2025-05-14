import {
  type FC,
  type MouseEventHandler,
  useActionState,
  useState,
  useRef
} from 'react'
import Card from '../../common/card/card'
import LoadingCard from '../../common/card/loading'
import { FormLabel } from '../../common/form/form'
import Image from '../../common/image/image'
import { useStore } from '@nanostores/react'
import { $site, setSettings } from '../../layout/dashboard/store'
import { $showToast, setToastMessage } from '~/components/layout/toast/store'
import { actions, isInputError } from 'astro:actions'
import SaveIcon from '~icons/lucide/save'

const SettingsSiteRC: FC = () => {
  return (
    <Card title='Edit Pengaturan Situs'>
      <ProfileForm />
    </Card>
  )
}

export default SettingsSiteRC

const ProfileForm: FC = () => {
  const ref = useRef<HTMLFormElement>(null)
  const [formChanged, setFormChanged] = useState(false)

  const updateUser = async (_: unknown, formData: FormData) => {
    const { data, error } = await actions.settings.update(formData)
    if (error && !data) {
      if (isInputError(error)) {
        return error
      }

      setToastMessage({
        error: true,
        message: error.message
      })
      return undefined
    }

    setToastMessage({
      message: 'Menyimpan perubahan...'
    })
    if (!showToast) {
      setSettings(data)
      setFormChanged(false)
    }
    return undefined
  }

  const [error, submitAction, isPending] = useActionState(updateUser, undefined)

  const site = useStore($site)
  const showToast = useStore($showToast)

  const handleFormChange = () => {
    setFormChanged(true)
  }

  const handleReset: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    ref.current?.reset()
    setFormChanged(false)
  }

  if (!site) {
    return <LoadingCard />
  }

  return (
    <form action={submitAction} className='flex flex-col gap-4' ref={ref}>
      <FormLabel label='Nama Situs'>
        <input
          name='name'
          className='input input-lg w-full'
          type='text'
          defaultValue={site.name}
          disabled={isPending || showToast}
          onChange={handleFormChange}
        />
        {error && error.fields.name && (
          <span className='text-error'>{error.fields.name.join(' | ')}</span>
        )}
      </FormLabel>

      <FormLabel label='Deskripsi Situs'>
        <input
          name='description'
          className='input input-lg w-full'
          type='text'
          defaultValue={site.description}
          disabled={isPending || showToast}
          onChange={handleFormChange}
        />
        {error && error.fields.description && (
          <span className='text-error'>
            {error.fields.description.join(' | ')}
          </span>
        )}
      </FormLabel>

      <FormLabel label='Logo Situs'>
        <div className='flex w-full flex-col items-center gap-4 md:flex-row'>
          <div className='avatar'>
            <div className='mask mask-mask-squircle h-[120px] w-[120px] border md:h-[80px] md:w-[80px]'>
              {site.logo && <Image src={site.logo} width={120} height={120} />}
            </div>
          </div>
          <input
            name='logo'
            className='file-input file-input-lg w-full'
            type='file'
            accept='image/*'
            disabled={isPending || showToast}
            onChange={handleFormChange}
          />
        </div>

        {error && error.fields.logo && (
          <span className='text-error'>{error.fields.logo.join(' | ')}</span>
        )}
      </FormLabel>

      <div className='mt-6 flex flex-row-reverse gap-4'>
        <button
          className='btn btn-primary flex items-center gap-2'
          type='submit'
          disabled={isPending || showToast || !formChanged}
        >
          <SaveIcon />
          <span>Simpan</span>
        </button>

        <button
          className='btn flex items-center gap-2'
          disabled={isPending || showToast || !formChanged}
          onClick={handleReset}
        >
          <span>Batalkan</span>
        </button>
      </div>
    </form>
  )
}
