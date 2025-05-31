import { useActionState, useEffect, useState, type FC } from 'react'
import { DialogTemplate } from '~/components/common/dialog/dialog'
import { useStore } from '@nanostores/react'
import {
  $currentUser,
  setCurrentUser,
  setUsers,
  $currentPage
} from './users.store'
import { actions, isInputError } from 'astro:actions'
import Image from '~/components/common/image/image'
import type { GetImageResult } from 'astro'
import RegionSelect from './region-select'

const UserDialog: FC = () => {
  const currentUser = useStore($currentUser)
  const currentPage = useStore($currentPage)
  const [profilePhoto, setProfilePhoto] = useState<GetImageResult | undefined>(
    undefined
  )
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<number>(
    currentUser?.accessLevel || 2
  )
  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>(
    currentUser?.regionId || undefined
  )

  const isEdit = currentUser && currentUser.id
  const isOpen = !!currentUser

  useEffect(() => {
    if (currentUser?.profilePhoto) {
      actions.image.getPresignedImage
        .orThrow({ fileName: currentUser.profilePhoto, height: 80, width: 80 })
        .then((image) => setProfilePhoto(image))
    } else {
      setProfilePhoto(undefined)
    }

    // Reset form state when dialog opens/closes
    if (currentUser) {
      setSelectedAccessLevel(currentUser.accessLevel || 2)
      setSelectedRegionId(currentUser.regionId || undefined)
    }
  }, [
    currentUser?.profilePhoto,
    currentUser?.accessLevel,
    currentUser?.regionId
  ])

  const handleSubmit = async (_prev: unknown, formData: FormData) => {
    const { data, error } = await actions.user.upsert(formData)
    if (error && !data) {
      if (isInputError(error)) {
        return error
      }

      console.error(error)
      return undefined
    }

    // Refresh the users list
    const updatedUsers = await actions.user.getAll.orThrow({
      page: currentPage,
      size: 10
    })
    setUsers(updatedUsers)
    setCurrentUser(undefined)
    return undefined
  }

  const [error, action, isPending] = useActionState(handleSubmit, undefined)

  if (!isOpen) {
    return <></>
  }

  return (
    <DialogTemplate
      title={isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}
      open={isOpen}
      closeAction={() => setCurrentUser(undefined)}
    >
      <form action={action} className='flex flex-col gap-4'>
        {isEdit && <input type='hidden' name='id' value={currentUser.id} />}

        <div>
          <label className='label' htmlFor='username'>
            Username
          </label>
          <input
            className='input w-full'
            type='text'
            id='username'
            name='username'
            defaultValue={currentUser?.username || ''}
            required
            disabled={isPending}
          />
          {error?.fields?.username && (
            <div className='label text-error'>
              {error.fields.username.join(', ')}
            </div>
          )}
        </div>

        <div>
          <label className='label' htmlFor='fullName'>
            Nama Lengkap
          </label>
          <input
            className='input w-full'
            type='text'
            id='fullName'
            name='fullName'
            defaultValue={currentUser?.fullName || ''}
            required
            disabled={isPending}
          />
          {error?.fields?.fullName && (
            <div className='label text-error'>
              {error.fields.fullName.join(', ')}
            </div>
          )}
        </div>

        <div>
          <label className='label' htmlFor='phoneNumber'>
            Nomor Telepon
          </label>
          <input
            className='input w-full'
            type='tel'
            id='phoneNumber'
            name='phoneNumber'
            defaultValue={currentUser?.phoneNumber || ''}
            disabled={isPending}
          />
          {error?.fields?.phoneNumber && (
            <div className='label text-error'>
              {error.fields.phoneNumber.join(', ')}
            </div>
          )}
        </div>

        <div>
          <label className='label' htmlFor='accessLevel'>
            Level Akses
          </label>
          <select
            className='select w-full'
            name='accessLevel'
            id='accessLevel'
            value={selectedAccessLevel}
            onChange={(e) => setSelectedAccessLevel(Number(e.target.value))}
            disabled={isPending}
            required
          >
            <option value={1}>Viewer</option>
            <option value={2}>Editor</option>
            <option value={3}>Coordinator</option>
            <option value={4}>Admin</option>
          </select>
          {error?.fields?.accessLevel && (
            <div className='label text-error'>
              {error.fields.accessLevel.join(', ')}
            </div>
          )}
        </div>

        <RegionSelect
          accessLevel={selectedAccessLevel}
          value={selectedRegionId}
          onChange={setSelectedRegionId}
          disabled={isPending}
          error={error?.fields?.regionId}
        />

        <div>
          <label className='label' htmlFor='profilePhotoFile'>
            Foto Profil
          </label>
          <div className='flex flex-col md:flex-row md:items-center md:gap-4'>
            {profilePhoto && (
              <div className='mb-4 flex justify-center md:mb-0 md:justify-start'>
                <Image
                  image={profilePhoto}
                  className='h-20 w-20 rounded-full border-2 border-gray-200 object-cover'
                  alt='Current profile photo'
                />
              </div>
            )}
            <input
              className='file-input file-input-ghost w-full md:flex-1'
              type='file'
              id='profilePhotoFile'
              name='profilePhotoFile'
              accept='image/*'
              disabled={isPending}
            />
          </div>
          {error?.fields?.profilePhotoFile && (
            <div className='label text-error'>
              {error.fields.profilePhotoFile.join(', ')}
            </div>
          )}
        </div>

        <fieldset className='fieldset'>
          <legend className='fieldset-legend'>
            {isEdit ? 'Ubah Password (opsional)' : 'Password'}
          </legend>

          <div>
            <label className='label' htmlFor='password'>
              Password {!isEdit && '*'}
            </label>
            <input
              className='input w-full'
              type='password'
              id='password'
              name='password'
              minLength={8}
              required={!isEdit}
              disabled={isPending}
            />
            {error?.fields?.password && (
              <div className='label text-error'>
                {error.fields.password.join(', ')}
              </div>
            )}
          </div>

          <div>
            <label className='label' htmlFor='confirmPassword'>
              Konfirmasi Password {!isEdit && '*'}
            </label>
            <input
              className='input w-full'
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              minLength={8}
              required={!isEdit}
              disabled={isPending}
            />
            {error?.fields?.confirmPassword && (
              <div className='label text-error'>
                {error.fields.confirmPassword.join(', ')}
              </div>
            )}
          </div>
        </fieldset>

        <div className='mt-4 flex justify-end gap-2'>
          <button
            type='button'
            className='btn btn-ghost'
            onClick={() => setCurrentUser(undefined)}
            disabled={isPending}
          >
            Batal
          </button>
          <button
            type='submit'
            className='btn btn-primary'
            disabled={isPending}
          >
            {isPending ? 'Menyimpan...' : isEdit ? 'Update' : 'Tambah'}
          </button>
        </div>
      </form>
    </DialogTemplate>
  )
}

export default UserDialog
