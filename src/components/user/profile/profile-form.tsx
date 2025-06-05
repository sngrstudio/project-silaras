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
import UsersIcon from '~icons/lucide/users'
import SaveIcon from '~icons/lucide/save'
import RotateCcwIcon from '~icons/lucide/rotate-ccw'
import CameraIcon from '~icons/lucide/camera'
import LockIcon from '~icons/lucide/lock'
import UserIcon from '~icons/lucide/user'
import PhoneIcon from '~icons/lucide/phone'
import XIcon from '~icons/lucide/x'
import UploadIcon from '~icons/lucide/upload'

const ProfileForm: FC = () => {
  const formRef = useRef<HTMLFormElement>(null)
  const currentUser = useStore($currentUser)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState<boolean>(false)

  const [formValues, setFormValues] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  })

  const [initialValues, setInitialValues] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (currentUser) {
      const values = {
        fullName: currentUser.fullName,
        phoneNumber: currentUser.phoneNumber ?? '',
        password: '',
        confirmPassword: ''
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
      selectedFile !== null ||
      removeExistingImage
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle file selection feedback
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)

    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    // Create preview URL for image
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  // Handle existing image removal
  const handleRemoveExistingImage = () => {
    setRemoveExistingImage(true)
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

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
      confirmPassword: ''
    }
    setFormValues(newValues)
    setInitialValues(newValues)

    // Clear file input and preview
    setSelectedFile(null)
    setRemoveExistingImage(false)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
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
    <div className='flex flex-col gap-6 p-6 md:p-8'>
      <div className='mb-2'>
        <h1 className='text-base-content text-2xl font-bold md:text-3xl'>
          Profil Pengguna
        </h1>
        <p className='text-base-content/70 mt-1 text-sm'>
          Kelola informasi profil dan pengaturan akun Anda
        </p>
      </div>

      <form ref={formRef} action={action} className='flex flex-col gap-6'>
        {removeExistingImage && (
          <input type='hidden' name='removeProfilePhoto' value='true' />
        )}

        {/* Basic Information Section */}
        <fieldset className='border-primary/20 from-primary/5 to-primary/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
          <legend className='border-primary/30 bg-base-100 text-primary flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
            <UsersIcon className='h-5 w-5' />
            Informasi Dasar
          </legend>

          <div className='grid gap-4 md:grid-cols-2'>
            {/* Username - Read Only */}
            <div className='space-y-1'>
              <label
                className='label-text flex items-center gap-2 text-sm font-medium'
                htmlFor='username'
              >
                <UserIcon className='text-base-content/60 h-4 w-4' />
                Username
              </label>
              <input
                className='input input-bordered bg-base-200/50 w-full'
                type='text'
                id='username'
                name='username'
                defaultValue={currentUser.username}
                disabled
                readOnly
              />
              <div className='text-base-content/60 text-xs'>
                Username tidak dapat diubah
              </div>
            </div>

            {/* Full Name */}
            <div className='space-y-1'>
              <label
                className='label-text flex items-center gap-2 text-sm font-medium'
                htmlFor='fullName'
              >
                <UserIcon className='text-base-content/60 h-4 w-4' />
                Nama Lengkap
              </label>
              <input
                className='input input-bordered w-full'
                type='text'
                id='fullName'
                name='fullName'
                required
                defaultValue={currentUser.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={isPending}
              />
              {error?.fields?.fullName && (
                <div className='text-error text-xs'>
                  {error.fields.fullName.join(', ')}
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className='space-y-1 md:col-span-2'>
              <label
                className='label-text flex items-center gap-2 text-sm font-medium'
                htmlFor='phoneNumber'
              >
                <PhoneIcon className='text-base-content/60 h-4 w-4' />
                Nomor Telepon
              </label>
              <input
                className='input input-bordered w-full'
                type='tel'
                id='phoneNumber'
                name='phoneNumber'
                defaultValue={currentUser.phoneNumber ?? ''}
                onChange={(e) =>
                  handleInputChange('phoneNumber', e.target.value)
                }
                disabled={isPending}
              />
              {error?.fields?.phoneNumber && (
                <div className='text-error text-xs'>
                  {error.fields.phoneNumber.join(', ')}
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* Profile Photo Section */}
        <fieldset className='border-success/20 from-success/5 to-success/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
          <legend className='border-success/30 bg-base-100 text-success flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
            <CameraIcon className='h-5 w-5' />
            Foto Profil
          </legend>

          <div className='card from-base-100 to-base-200/50 border-base-300 border bg-gradient-to-br shadow-sm'>
            <div className='card-body p-4'>
              {/* Preview or existing photo */}
              {(previewUrl ||
                (currentUser?.profilePhoto && !removeExistingImage)) && (
                <div className='mb-4 flex justify-center'>
                  <div className='relative'>
                    <div className='border-base-300/50 ring-base-300/20 overflow-hidden rounded-full border-2 shadow-lg ring-2'>
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt='Preview foto profil'
                          className='h-24 w-24 object-cover'
                        />
                      ) : (
                        <Image
                          publicId={currentUser.profilePhoto!}
                          width={96}
                          height={96}
                          sizes='96px'
                          breakpoints={[96, 128, 192]}
                          className='h-24 w-24 object-cover'
                          alt='Foto profil saat ini'
                        />
                      )}
                    </div>

                    {/* Preview badge */}
                    {previewUrl && (
                      <div className='bg-success text-success-content absolute -top-1 -right-1 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold shadow-lg'>
                        BARU
                      </div>
                    )}

                    {/* Remove button for existing photo */}
                    {currentUser?.profilePhoto &&
                      !previewUrl &&
                      !removeExistingImage && (
                        <button
                          type='button'
                          onClick={handleRemoveExistingImage}
                          className='btn btn-circle btn-xs btn-error absolute -top-1 -right-1 shadow-lg transition-all duration-200 hover:scale-110'
                          aria-label='Hapus foto profil'
                        >
                          <XIcon className='h-3 w-3' />
                        </button>
                      )}
                  </div>
                </div>
              )}

              {/* File upload area */}
              <div className='relative'>
                <label
                  htmlFor='profilePhotoFile'
                  className='border-base-300 hover:border-success hover:bg-success/5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-all duration-200'
                >
                  <UploadIcon className='text-success h-5 w-5' />
                  <div className='flex flex-col items-center gap-1'>
                    <span className='text-base-content/70 text-sm font-medium'>
                      {selectedFile
                        ? `File terpilih: ${selectedFile.name}`
                        : currentUser?.profilePhoto && !removeExistingImage
                          ? 'Ganti foto profil'
                          : 'Upload foto profil'}
                    </span>
                    {selectedFile && (
                      <span className='text-success text-xs font-medium'>
                        ✓ Siap untuk disimpan
                      </span>
                    )}
                  </div>
                </label>

                <input
                  type='file'
                  id='profilePhotoFile'
                  name='profilePhotoFile'
                  accept='image/*'
                  onChange={handleFileChange}
                  disabled={isPending}
                  className='hidden'
                />
              </div>

              <div className='text-base-content/60 mt-2 text-xs'>
                Format yang didukung: JPG, PNG, WebP (Maks. 5MB)
              </div>
            </div>
          </div>
        </fieldset>

        {/* Password Section */}
        <fieldset className='border-warning/20 from-warning/5 to-warning/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
          <legend className='border-warning/30 bg-base-100 text-warning flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
            <LockIcon className='h-5 w-5' />
            Ubah Password
          </legend>

          <div className='grid gap-4 md:grid-cols-2'>
            {/* New Password */}
            <div className='space-y-1'>
              <label
                className='label-text flex items-center gap-2 text-sm font-medium'
                htmlFor='password'
              >
                <LockIcon className='text-base-content/60 h-4 w-4' />
                Password Baru
              </label>
              <input
                className='input input-bordered w-full'
                type='password'
                id='password'
                name='password'
                minLength={8}
                placeholder='Kosongkan jika tidak ingin mengubah'
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isPending}
              />
              {error?.fields?.password && (
                <div className='text-error text-xs'>
                  {error.fields.password.join(', ')}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className='space-y-1'>
              <label
                className='label-text flex items-center gap-2 text-sm font-medium'
                htmlFor='confirmPassword'
              >
                <LockIcon className='text-base-content/60 h-4 w-4' />
                Konfirmasi Password
              </label>
              <input
                className='input input-bordered w-full'
                type='password'
                id='confirmPassword'
                name='confirmPassword'
                minLength={8}
                placeholder='Ulangi password baru'
                onChange={(e) =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                disabled={isPending}
              />
              {error?.fields?.confirmPassword && (
                <div className='text-error text-xs'>
                  {error.fields.confirmPassword.join(', ')}
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className='border-base-300 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end'>
          <button
            type='button'
            className='btn btn-ghost'
            disabled={isPending}
            onClick={() => {
              if (currentUser) {
                const resetValues = {
                  fullName: currentUser.fullName,
                  phoneNumber: currentUser.phoneNumber ?? '',
                  password: '',
                  confirmPassword: ''
                }
                setFormValues(resetValues)

                // Clear file input and preview
                setSelectedFile(null)
                setRemoveExistingImage(false)
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl)
                  setPreviewUrl(null)
                }
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
            <RotateCcwIcon className='h-4 w-4' />
            Reset
          </button>

          <button
            type='submit'
            className='btn btn-primary'
            disabled={isPending || !hasChanges()}
          >
            {isPending && (
              <span className='loading loading-spinner loading-sm'></span>
            )}
            <SaveIcon className='h-4 w-4' />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileForm
