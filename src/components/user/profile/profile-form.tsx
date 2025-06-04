import { useActionState, useEffect, useRef, useState, type FC } from 'react'
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
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (_prev: unknown, formData: FormData) => {
    if (!currentUser) {
      showErrorToast(
        'Tidak dapat memperbarui profil: pengguna tidak ditemukan.'
      )
      return undefined
    }

    // Add required fields for upsert action
    formData.append('id', currentUser.id)
    formData.append('accessLevel', currentUser.accessLevel.toString())
    formData.append('username', currentUser.username)

    const result = await actions.user.upsert(formData)

    if (result.error) {
      if (isInputError(result.error)) {
        return result.error
      }
      showErrorToast(
        'Terjadi kesalahan saat memperbarui profil. Silakan coba lagi.'
      )
      return undefined
    }

    const updatedUser = await actions.user.getCurrent()
    if (updatedUser.data) {
      setCurrentUser(updatedUser.data)
    }

    // Reset form to new values
    const newValues = {
      fullName: formValues.fullName,
      phoneNumber: formValues.phoneNumber,
      password: '',
      confirmPassword: '',
      profilePhotoFile: null
    }
    setFormValues(newValues)
    setInitialValues(newValues)

    // Clear file input
    if (formRef.current) {
      const fileInput = formRef.current.querySelector(
        '#profilePhotoFile'
      ) as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    }

    showSuccessToast('Profil berhasil diperbarui!')
    return undefined
  }

  const [error, action, isPending] = useActionState(handleSubmit, undefined)

  if (!currentUser) {
    return (
      <div className='flex items-center justify-center p-8'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      action={action}
      className='flex flex-col gap-6 p-6 md:p-8'
    >
      <h1 className='text-xl font-bold md:text-2xl'>Profil Pengguna</h1>

      <div className='grid gap-6 md:grid-cols-2'>
        <div>
          <label className='label' htmlFor='username'>
            Username
          </label>
          <input
            className='input md:input-lg w-full'
            type='text'
            id='username'
            name='username'
            defaultValue={currentUser.username}
            disabled
            readOnly
          />
          <div className='label text-sm text-gray-500'>
            Username tidak dapat diubah
          </div>
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
            required
            defaultValue={currentUser.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
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
            {currentUser?.profilePhoto && (
              <div className='mb-4 flex justify-center md:mb-0 md:justify-start'>
                <Image
                  publicId={currentUser.profilePhoto}
                  width={80}
                  height={80}
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
                handleInputChange(
                  'profilePhotoFile',
                  e.target.files?.[0] || null
                )
              }
              disabled={isPending}
            />
          </div>
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

      <div className='flex flex-col gap-3 sm:flex-row-reverse'>
        <button
          type='submit'
          className='btn btn-primary md:btn-lg'
          disabled={isPending || !hasChanges()}
        >
          {isPending && <span className='loading loading-spinner'></span>}
          Simpan Perubahan
        </button>

        <button
          type='reset'
          className='btn btn-ghost md:btn-lg'
          disabled={isPending}
          onClick={() => {
            if (currentUser) {
              const resetValues = {
                fullName: currentUser.fullName,
                phoneNumber: currentUser.phoneNumber ?? '',
                password: '',
                confirmPassword: '',
                profilePhotoFile: null
              }
              setFormValues(resetValues)

              // Clear file input
              if (formRef.current) {
                const fileInput = formRef.current.querySelector(
                  '#profilePhotoFile'
                ) as HTMLInputElement
                if (fileInput) {
                  fileInput.value = ''
                }
              }
            }
          }}
        >
          Reset
        </button>
      </div>
    </form>
  )
}

export default ProfileForm
