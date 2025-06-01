import { useActionState, useEffect, useRef, useState, type FC } from 'react'
import type { GetImageResult } from 'astro'
import { useStore } from '@nanostores/react'
import {
  $currentUser,
  setCurrentUser
} from '~/components/layout/drawer/drawer.store'
import { actions, isInputError } from 'astro:actions'
import Image from '~/components/common/image/image'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'

const ProfileForm: FC = () => {
  const formRef = useRef<HTMLFormElement>(null)
  const currentUser = useStore($currentUser)
  const [profilePhoto, setProfilePhoto] = useState<GetImageResult | undefined>(
    undefined
  )
  const [formValues, setFormValues] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    profilePhotoFile: null as File | null
  })
  const [initialValues, setInitialValues] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    profilePhotoFile: null as File | null
  })

  useEffect(() => {
    if (currentUser && currentUser.profilePhoto) {
      actions.image.getPresignedImage
        .orThrow({ fileName: currentUser.profilePhoto, height: 50, width: 50 })
        .then((image) => setProfilePhoto(image))
    }
  }, [currentUser?.profilePhoto])

  useEffect(() => {
    if (currentUser) {
      const values = {
        fullName: currentUser.fullName,
        phoneNumber: currentUser.phoneNumber ?? '',
        password: '',
        confirmPassword: '',
        profilePhotoFile: null
      }
      setFormValues(values)
      setInitialValues(values)
    }
  }, [currentUser])

  const hasChanges = () => {
    return (
      formValues.fullName !== initialValues.fullName ||
      formValues.phoneNumber !== initialValues.phoneNumber ||
      formValues.password !== initialValues.password ||
      formValues.confirmPassword !== initialValues.confirmPassword ||
      formValues.profilePhotoFile !== null
    )
  }

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    if (formRef.current) {
      formRef.current.reset()
      setFormValues(initialValues)
    }
  }

  const handleForm = async (_prev: unknown, formData: FormData) => {
    const { error, data } = await actions.user.upsert(formData)

    if (error && !data) {
      if (isInputError(error)) {
        return error
      }

      // Handle specific error codes with user-friendly messages
      switch (error.code) {
        case 'BAD_REQUEST':
          if (error.message.includes('Username')) {
            showErrorToast(
              'Username yang dipilih sudah digunakan oleh pengguna lain.'
            )
          } else if (error.message.includes('Nomor telepon')) {
            showErrorToast(
              'Nomor telepon yang dimasukkan sudah digunakan oleh pengguna lain.'
            )
          } else {
            showErrorToast(
              error.message ||
                'Data yang dimasukkan tidak valid. Silakan periksa kembali.'
            )
          }
          break
        case 'FORBIDDEN':
          showErrorToast(
            'Anda tidak memiliki izin untuk mengubah data profil ini.'
          )
          break
        case 'INTERNAL_SERVER_ERROR':
          showErrorToast(
            'Terjadi masalah pada server. Silakan coba lagi nanti.'
          )
          break
        default:
          showErrorToast(
            'Terjadi kesalahan saat menyimpan profil. Silakan coba lagi.'
          )
      }
      return undefined
    }

    if (data) {
      setCurrentUser(data)
      showSuccessToast('Profil berhasil diperbarui!')
    }
    return undefined
  }

  const [error, action, isPending] = useActionState(handleForm, undefined)

  if (!currentUser) {
    return <></>
  }

  return (
    <form
      className='flex w-full flex-col gap-y-4'
      action={action}
      ref={formRef}
    >
      <input type='hidden' name='id' value={currentUser.id} />
      <input type='hidden' name='accessLevel' value={currentUser.accessLevel} />

      <div>
        <label className='label' htmlFor='username'>
          Username
        </label>
        <input
          className='input input-disabled md:input-lg w-full'
          type='text'
          id='username'
          name='username'
          value={currentUser.username}
          required
          readOnly
          disabled={isPending}
        />
      </div>

      <div>
        <label className='label' htmlFor='fullName'>
          Nama Lengkap
        </label>
        <input
          className='input md:input-lg w-full'
          type='text'
          id='fullName'
          name='fullName'
          defaultValue={currentUser.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
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
          className='input md:input-lg w-full'
          type='tel'
          id='phoneNumber'
          name='phoneNumber'
          defaultValue={currentUser.phoneNumber ?? ''}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          disabled={isPending}
        />
        {error?.fields?.phoneNumber && (
          <div className='label text-error'>
            {error.fields.phoneNumber.join(', ')}
          </div>
        )}
      </div>

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
            className='file-input md:file-input-lg file-input-ghost w-full md:flex-1'
            type='file'
            id='profilePhotoFile'
            name='profilePhotoFile'
            accept='image/*'
            onChange={(e) =>
              handleInputChange('profilePhotoFile', e.target.files?.[0] || null)
            }
            disabled={isPending}
          />
        </div>
      </div>

      <fieldset className='fieldset'>
        <legend className='fieldset-legend'>Ubah Password (opsional)</legend>

        <div>
          <label className='label' htmlFor='password'>
            Password Baru
          </label>
          <input
            className='input md:input-lg w-full'
            type='password'
            id='password'
            name='password'
            minLength={8}
            onChange={(e) => handleInputChange('password', e.target.value)}
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
            Konfirmasi Password Baru
          </label>
          <input
            className='input md:input-lg w-full'
            type='password'
            id='confirmPassword'
            name='confirmPassword'
            minLength={8}
            onChange={(e) =>
              handleInputChange('confirmPassword', e.target.value)
            }
            disabled={isPending}
          />
          {error?.fields?.confirmPassword && (
            <div className='label text-error'>
              {error.fields.confirmPassword.join(', ')}
            </div>
          )}
        </div>
      </fieldset>

      <div className='flex w-full flex-col-reverse gap-2 md:flex-row-reverse'>
        <button
          className='btn btn-primary max-md:w-full'
          type='submit'
          disabled={isPending || !hasChanges()}
        >
          Simpan Perubahan
        </button>
        <button
          className='btn btn-ghost max-md:w-full'
          type='button'
          onClick={handleReset}
          disabled={isPending || !hasChanges()}
        >
          Reset
        </button>
      </div>
    </form>
  )
}

export default ProfileForm
