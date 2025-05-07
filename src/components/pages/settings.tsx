import { type FC, type MouseEventHandler, useActionState, useRef } from 'react'
import CardTemplate from '../common/card'
import LoadingCard from '../common/loading'
import { Form } from 'radix-ui'
import { useStore } from '@nanostores/react'
import { $settings, setSettings } from './stores/settings'
import { setToastOn } from '../toast/store'
import { actions, isInputError } from 'astro:actions'
import SaveIcon from '~icons/lucide/save'
import ResetIcon from '~icons/lucide/circle-x'

const SettingsCardRC: FC<{ title: string }> = ({ title }) => {
  const settingsData = useStore($settings)
  const ref = useRef<HTMLFormElement>(null)

  const [_state, submitAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      const { data: settings, error } = await actions.settings.set(formData)
      if (error && !settings) {
        const message = !isInputError(error)
          ? error.message
          : error.fields.name
            ? error.fields.name.join(', ')
            : error.fields.description
              ? error.fields.description.join(', ')
              : 'Terjadi kesalahan yang tidak diketahui.'

        setToastOn({
          error: true,
          message
        })
        return null
      }

      setSettings(settings)
      setToastOn({
        message: 'Berhasil memperbarui pengaturan.'
      })
      return null
    },

    null
  )

  const handleReset: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    ref.current?.reset()
  }

  if (!settingsData) {
    return <LoadingCard />
  }

  const settings = {
    name: settingsData.find((s) => s.property === 'SITE_NAME')!,
    description: settingsData.find((s) => s.property === 'SITE_DESCRIPTION')!
  }

  return (
    <CardTemplate title={title}>
      <Form.Root
        action={submitAction}
        className='flex flex-1 flex-col gap-4'
        ref={ref}
      >
        {/* name */}
        <Form.Field name='name' className='flex flex-col gap-2'>
          <Form.Label className='font-bold'>Nama</Form.Label>
          <Form.Control
            className='input input-lg w-full'
            defaultValue={settings.name.value}
          />
        </Form.Field>

        {/* description */}
        <Form.Field name='description' className='flex flex-col gap-2'>
          <Form.Label className='font-bold'>Nama</Form.Label>
          <Form.Control
            className='input input-lg w-full'
            defaultValue={settings.description.value}
          />
        </Form.Field>

        <div className='mt-4 flex flex-row-reverse items-center justify-between'>
          {/* the save button */}
          <Form.Submit className='btn btn-primary w-max' disabled={isPending}>
            {isPending ? (
              <span className='loading loading-dots loading-xs'></span>
            ) : (
              <SaveIcon />
            )}
            <span>Simpan</span>
          </Form.Submit>

          {/* the reset button */}
          <button className='btn btn-warning' onClick={handleReset}>
            <ResetIcon />
            <span>Reset</span>
          </button>
        </div>
      </Form.Root>
    </CardTemplate>
  )
}

export default SettingsCardRC
