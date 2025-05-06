import { type FC, type MouseEventHandler, useRef } from 'react'
import CardTemplate from '../common/card'
import LoadingCard from '../common/loading'
import { Form } from 'radix-ui'
import { useStore } from '@nanostores/react'
import { $userProfile } from '../layout/store'
import SaveIcon from '~icons/lucide/save'
import ResetIcon from '~icons/lucide/circle-x'

const ProfileCardRC: FC<{ title: string }> = ({ title }) => {
  const userProfile = useStore($userProfile)
  const ref = useRef<HTMLFormElement>(null)

  const handleReset: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    ref.current?.reset()
  }

  if (!userProfile) {
    return <LoadingCard />
  }

  return (
    <CardTemplate title={title}>
      <Form.Root className='flex flex-1 flex-col gap-4' ref={ref}>
        {/* name */}
        <Form.Field name='fullName' className='flex flex-col gap-2'>
          <Form.Label className='font-bold'>Nama</Form.Label>
          <Form.Control
            className='input input-lg w-full'
            defaultValue={userProfile.fullName || ''}
          />
        </Form.Field>

        {/* username */}
        <Form.Field name='userName' className='flex flex-col gap-2'>
          <Form.Label className='font-bold'>Username</Form.Label>
          <Form.Control
            className='input input-lg w-full'
            value={userProfile.userName}
            disabled
          />
          <span className='text-base-content/50 text-sm'>
            Username tidak dapat diganti.
          </span>
        </Form.Field>

        {/* role */}
        <Form.Field name='userName' className='flex flex-col gap-2'>
          <Form.Label className='font-bold'>Hak Akses</Form.Label>
          <Form.Control
            className='input input-lg w-full'
            value={userProfile.role}
            disabled
          />
          <span className='text-base-content/50 text-sm'>
            Hak akses hanya dapat diganti oleh administrator di menu Pengguna.
          </span>
        </Form.Field>

        {/* phone */}
        <Form.Field name='phoneNumber' className='flex flex-col gap-2'>
          <Form.Label className='font-bold'>Nomor Telepon</Form.Label>
          <Form.Control
            className='input input-lg w-full'
            defaultValue={userProfile.phoneNumber || ''}
          />
          <span className='text-base-content/50 text-sm'>
            Isilah untuk kemudahan admin menghubungi Anda.
          </span>
        </Form.Field>

        <div className='mt-4 flex flex-row-reverse items-center justify-between'>
          {/* the save button */}
          <Form.Submit className='btn btn-primary w-max'>
            <SaveIcon />
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

export default ProfileCardRC
