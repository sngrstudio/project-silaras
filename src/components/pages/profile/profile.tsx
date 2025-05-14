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
import { $user, $accessLevels, setUser } from './store'
import { $showToast, setToastMessage } from '~/components/layout/toast/store'
import { actions, isInputError } from 'astro:actions'
import SaveIcon from '~icons/lucide/save'

const ProfileRC: FC = () => {
  return (
    <Card title='Edit Profil'>
      <ProfileForm />
    </Card>
  )
}

export default ProfileRC

const ProfileForm: FC = () => {
  const ref = useRef<HTMLFormElement>(null)
  const [formChanged, setFormChanged] = useState(false)

  const updateUser = async (_: any, formData: FormData) => {
    const { data, error } = await actions.user.create(formData)
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
      setUser(data)
      setFormChanged(false)
    }
    return undefined
  }

  const [error, submitAction, isPending] = useActionState(updateUser, undefined)

  const user = useStore($user)
  const accessLevels = useStore($accessLevels)
  const showToast = useStore($showToast)

  const handleFormChange = () => {
    setFormChanged(true)
  }

  const handleReset: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    ref.current?.reset()
    setFormChanged(false)
  }

  if (!user) {
    return <LoadingCard />
  }

  return (
    <form action={submitAction} className='flex flex-col gap-4' ref={ref}>
      <FormLabel label='Nama'>
        <input
          name='fullName'
          className='input input-lg w-full'
          type='text'
          defaultValue={user.fullName}
          disabled={isPending || showToast}
          onChange={handleFormChange}
        />
        {error && error.fields.fullName && (
          <span className='text-error'>
            {error.fields.fullName.join(' | ')}
          </span>
        )}
      </FormLabel>

      <FormLabel label='Username'>
        <input
          name='userNameReadonly'
          className='input input-lg w-full'
          type='text'
          value={user.userName}
          disabled
        />
        <span className='italic'>
          Username bersifat permanen dan tidak dapat diganti.
        </span>
      </FormLabel>

      <FormLabel label='Hak Akses'>
        <input
          name='accessLevelReadonly'
          className='input input-lg w-full'
          type='text'
          value={
            accessLevels
              ? accessLevels.find((lv) => lv.id === user.accessLevel)
                  ?.description
              : '...'
          }
          disabled
        />
        <span className='italic'>
          Hak akses hanya dapat diganti oleh Administrator.
        </span>
      </FormLabel>

      <FormLabel label='Nomor Telepon'>
        <input
          name='phoneNumber'
          className='input input-lg w-full'
          type='text'
          defaultValue={user.phoneNumber || ''}
          disabled={isPending || showToast}
          onChange={handleFormChange}
        />
        {error && error.fields.phoneNumber && (
          <span className='text-error'>
            {error.fields.phoneNumber.join(' | ')}
          </span>
        )}
      </FormLabel>

      <FormLabel label='Foto Profil'>
        <input
          name='profilePhoto'
          className='file-input file-input-lg w-full'
          type='file'
          accept='image/*'
          disabled={isPending || showToast}
          onChange={handleFormChange}
        />
        {error && error.fields.profilePhoto && (
          <span className='text-error'>
            {error.fields.profilePhoto.join(' | ')}
          </span>
        )}
      </FormLabel>

      {user.profilePhoto && (
        <Image
          className='h-[180px] w-[180px]'
          src={user.profilePhoto}
          width={180}
          height={180}
        />
      )}

      <input name='userName' type='hidden' value={user.userName} />
      <input name='accessLevel' type='hidden' value={user.accessLevel} />

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
