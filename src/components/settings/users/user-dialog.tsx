import { useActionState, useEffect, useState, type FC } from 'react'
import DialogComponent from '~/components/common/dialog/dialog'
import { useStore } from '@nanostores/react'
import {
  $currentUser,
  setCurrentUser,
  setUsers,
  $currentPage
} from './users.store'
import { $currentUser as $globalCurrentUser } from '~/components/layout/drawer/drawer.store'
import { actions, isInputError } from 'astro:actions'
import Image from '~/components/common/image/image'
import type { GetImageResult } from 'astro'
import RegionSelect from './region-select'
import { getAllowedAccessLevels } from '~/utils/access-control'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'

const UserDialog: FC = () => {
  const currentUser = useStore($currentUser)
  const globalCurrentUser = useStore($globalCurrentUser)
  const currentPage = useStore($currentPage)
  const [profilePhoto, setProfilePhoto] = useState<GetImageResult | undefined>(
    undefined
  )
  // Initialize with defaults for a new user; useEffect will populate for existing users.
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<number>(2)
  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>(
    undefined
  )

  const isEdit = currentUser && currentUser.id
  const isOpen = !!currentUser

  // Get allowed access levels for current user
  const allowedAccessLevels = getAllowedAccessLevels(globalCurrentUser)

  useEffect(() => {
    if (currentUser) {
      // User is being edited, or a new user template is provided
      setSelectedAccessLevel(currentUser.accessLevel || 2) // Use DB value or default to 2
      setSelectedRegionId(currentUser.regionId || undefined)

      if (currentUser.profilePhoto) {
        actions.image.getPresignedImage
          .orThrow({
            fileName: currentUser.profilePhoto,
            height: 80,
            width: 80
          })
          .then((image) => setProfilePhoto(image))
      } else {
        setProfilePhoto(undefined)
      }
    } else {
      // Dialog is closed or opened for a brand new user without a template
      // Reset form state to defaults for a new user
      setSelectedAccessLevel(2) // Default access level for a new user
      setSelectedRegionId(undefined)
      setProfilePhoto(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]) // Depend on the currentUser object itself

  const handleSubmit = async (_prev: unknown, formData: FormData) => {
    const { data, error } = await actions.user.upsert(formData)
    if (error && !data) {
      if (isInputError(error)) {
        return error
      }

      // Handle specific error codes with user-friendly messages
      switch (error.code) {
        case 'BAD_REQUEST':
          if (error.message.includes('Username')) {
            showErrorToast(
              'Username yang dipilih sudah digunakan oleh pengguna lain. Silakan pilih username yang berbeda.'
            )
          } else if (error.message.includes('Nomor telepon')) {
            showErrorToast(
              'Nomor telepon yang dimasukkan sudah digunakan oleh pengguna lain. Silakan gunakan nomor telepon yang berbeda.'
            )
          } else {
            showErrorToast(
              error.message ||
                'Data yang dimasukkan tidak valid. Silakan periksa kembali.'
            )
          }
          break
        case 'FORBIDDEN':
          if (error.message.includes('level akses')) {
            showErrorToast(
              'Anda tidak memiliki izin untuk membuat atau mengedit pengguna dengan level akses tersebut.'
            )
          } else if (error.message.includes('wilayah')) {
            showErrorToast(
              'Anda tidak memiliki izin untuk menugaskan pengguna ke wilayah tersebut.'
            )
          } else {
            showErrorToast(
              error.message ||
                'Anda tidak memiliki izin untuk melakukan tindakan ini.'
            )
          }
          break
        case 'NOT_FOUND':
          showErrorToast('Pengguna atau data yang dicari tidak ditemukan.')
          break
        case 'INTERNAL_SERVER_ERROR':
          showErrorToast(
            'Terjadi masalah pada server. Silakan coba lagi nanti.'
          )
          break
        default:
          showErrorToast(
            'Terjadi kesalahan saat menyimpan data pengguna. Silakan coba lagi.'
          )
      }
      return undefined
    }

    // Refresh the users list
    const updatedUsers = await actions.user.getAll.orThrow({
      page: currentPage,
      size: 10
    })
    setUsers(updatedUsers)
    setCurrentUser(undefined)
    showSuccessToast(
      currentUser?.id
        ? 'Data pengguna berhasil diperbarui!'
        : 'Pengguna baru berhasil ditambahkan!'
    )
    return undefined
  }

  const [error, action, isPending] = useActionState(handleSubmit, undefined)

  if (!isOpen) {
    return <></>
  }

  return (
    <DialogComponent
      title={isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}
      open={isOpen}
      onOpenChange={(open) => !open && setCurrentUser(undefined)}
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
            disabled={isPending || !!isEdit} // Disable if pending or if editing an existing user
            required
          >
            {/* For new users, filter options based on allowedAccessLevels */}
            {/* For existing users (isEdit === true), show their current level, but disabled */}
            {isEdit && currentUser?.accessLevel === 1 && (
              <option value={1}>Viewer</option>
            )}
            {isEdit && currentUser?.accessLevel === 2 && (
              <option value={2}>Editor</option>
            )}
            {isEdit && currentUser?.accessLevel === 3 && (
              <option value={3}>Coordinator</option>
            )}
            {isEdit && currentUser?.accessLevel === 4 && (
              <option value={4}>Admin</option>
            )}

            {!isEdit && allowedAccessLevels.includes(1) && (
              <option value={1}>Viewer</option>
            )}
            {!isEdit && allowedAccessLevels.includes(2) && (
              <option value={2}>Editor</option>
            )}
            {!isEdit && allowedAccessLevels.includes(3) && (
              <option value={3}>Coordinator</option>
            )}
            {/* Admin creation (level 4) is typically handled by first signup or by other admins directly */}
            {/* We might not need to show level 4 here if it's not in allowedAccessLevels for the current globalUser */}
            {!isEdit && allowedAccessLevels.includes(4) && (
              <option value={4}>Admin</option>
            )}
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
          currentUser={globalCurrentUser}
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
    </DialogComponent>
  )
}

export default UserDialog
