import type { FC } from 'react'
import Card from '../card/card'
import LoadingCard from '../card/loading'
import { FormLabel } from '../form/form'
import { useStore } from '@nanostores/react'
import { $user, $accessLevels } from './store'
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
  const user = useStore($user)
  const accessLevels = useStore($accessLevels)

  if (!user) {
    return <LoadingCard />
  }

  return (
    <form action='' className='flex flex-col gap-4'>
      <FormLabel label='Nama'>
        <input
          className='input input-lg w-full'
          type='text'
          defaultValue={user.fullName}
        />
      </FormLabel>

      <FormLabel label='Username'>
        <input
          className='input input-lg w-full'
          type='text'
          defaultValue={user.userName}
          disabled
        />
        <span className='italic'>
          Username bersifat permanen dan tidak dapat diganti.
        </span>
      </FormLabel>

      <FormLabel label='Hak Akses'>
        <select className='select select-lg w-full' disabled>
          {accessLevels &&
            accessLevels.map((level) => (
              <option
                value={level.id}
                selected={level.id === user.accessLevel}
                key={level.id}
              >
                {level.description}
              </option>
            ))}
        </select>
        <span className='italic'>
          Hak akses hanya dapat diganti oleh Administrator.
        </span>
      </FormLabel>

      <FormLabel label='Nomor Telepon'>
        <input
          className='input input-lg w-full'
          type='text'
          defaultValue={user.phoneNumber || ''}
        />
      </FormLabel>

      <div className='mt-6 flex flex-row-reverse gap-4'>
        <button
          className='btn btn-primary flex items-center gap-2'
          type='submit'
        >
          <SaveIcon />
          <span>Simpan</span>
        </button>

        <button className='btn flex items-center gap-2' type='reset'>
          <span>Batalkan</span>
        </button>
      </div>
    </form>
  )
}
