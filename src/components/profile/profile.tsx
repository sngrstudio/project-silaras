import { type FC } from 'react'
import Card from '../card/card'
import LoadingCard from '../card/loading'
import { useStore } from '@nanostores/react'
import { $user } from './store'

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

  if (!user) {
    return <LoadingCard />
  }

  return (
    <form action='' className='flex flex-col gap-4'>
      <label className='flex flex-col gap-1'>
        <span className='font-bold lg:text-lg'>Nama</span>
        <input
          className='input input-lg w-full'
          type='text'
          defaultValue={user.fullName}
        />
      </label>

      <label className='flex flex-col gap-1'>
        <span className='font-bold lg:text-lg'>Username</span>
        <input
          className='input input-lg w-full'
          type='text'
          value={user.userName}
          disabled
        />
      </label>

      <label className='flex flex-col gap-1'>
        <span className='font-bold lg:text-lg'>Akses Level</span>
        <input
          className='input input-lg w-full'
          type='text'
          defaultValue={user.accessLevel}
        />
      </label>

      <label className='flex flex-col gap-1'>
        <span className='font-bold lg:text-lg'>No Telepon</span>
        <input
          className='input input-lg w-full'
          type='text'
          defaultValue={user.phoneNumber || ''}
        />
      </label>

      <div className='mt-6'>
        <input className='btn btn-primary' type='submit'>
          <span>Simpan</span>
        </input>
      </div>
    </form>
  )
}
