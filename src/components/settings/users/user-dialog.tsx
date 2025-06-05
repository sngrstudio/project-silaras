import { useActionState, useEffect, useState, useRef, type FC } from 'react'
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
import RegionSelect from './region-select'
import {
  getAllowedAccessLevels,
  getAccessLevelName
} from '~/utils/access-control'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'
import UsersIcon from '~icons/lucide/users'
import SaveIcon from '~icons/lucide/save'
import XIcon from '~icons/lucide/x'
import LoaderIcon from '~icons/lucide/loader'
import CameraIcon from '~icons/lucide/camera'
import LockIcon from '~icons/lucide/lock'
import KeyIcon from '~icons/lucide/key'
import EyeIcon from '~icons/lucide/eye'
import EditIcon from '~icons/lucide/edit'
import ShieldIcon from '~icons/lucide/shield'
import UploadIcon from '~icons/lucide/upload'

const getAccessLevelColor = (accessLevel: number) => {
  switch (accessLevel) {
    case 1:
      return 'text-gray-600'
    case 2:
      return 'text-blue-600'
    case 3:
      return 'text-green-600'
    case 4:
      return 'text-purple-600'
    default:
      return 'text-gray-600'
  }
}

const getAccessLevelIcon = (accessLevel: number) => {
  switch (accessLevel) {
    case 1:
      return EyeIcon
    case 2:
      return EditIcon
    case 3:
      return UsersIcon
    case 4:
      return ShieldIcon
    default:
      return EyeIcon
  }
}

const UserDialog: FC = () => {
  const currentUser = useStore($currentUser)
  const globalCurrentUser = useStore($globalCurrentUser)
  const currentPage = useStore($currentPage)
  const isMountedRef = useRef(true)

  // Initialize with defaults for a new user; useEffect will populate for existing users.
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<number>(2)
  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>(
    undefined
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState<boolean>(false)

  // Track form values to preserve them when submission fails
  const [formValues, setFormValues] = useState<{
    username?: string
    fullName?: string
    phoneNumber?: string
    password?: string
    confirmPassword?: string
  }>({})

  const isEdit = currentUser && currentUser.id
  const isOpen = !!currentUser

  // Get allowed access levels for current user
  const allowedAccessLevels = getAllowedAccessLevels(globalCurrentUser)

  // Filter out Admin PPPAPPKB (level 4) if the current user is PLKB Kecamatan (level 3)
  const filteredAccessLevels =
    globalCurrentUser?.accessLevel === 3
      ? allowedAccessLevels.filter((level) => level !== 4)
      : allowedAccessLevels

  useEffect(() => {
    if (currentUser) {
      // User is being edited, or a new user template is provided
      setSelectedAccessLevel(currentUser.accessLevel || 2) // Use DB value or default to 2
      setSelectedRegionId(currentUser.regionId || undefined)
      // Reset form values when switching users
      setFormValues({})
    } else {
      // Dialog is closed or opened for a brand new user without a template
      // Reset form state to defaults for a new user
      setSelectedAccessLevel(2) // Default access level for a new user
      setSelectedRegionId(undefined)
      setSelectedFile(null) // Reset file selection
      setPreviewUrl(null) // Reset preview URL
      setRemoveExistingImage(false) // Reset image removal flag
      setFormValues({}) // Reset form values
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]) // Depend on the currentUser object itself

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

  // Clean up preview URL on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Handle password confirmation validation
  useEffect(() => {
    const passwordInput = document.getElementById(
      'password'
    ) as HTMLInputElement
    const confirmPasswordInput = document.getElementById(
      'confirmPassword'
    ) as HTMLInputElement

    if (passwordInput && confirmPasswordInput) {
      const validatePassword = () => {
        if (
          confirmPasswordInput.value &&
          passwordInput.value !== confirmPasswordInput.value
        ) {
          confirmPasswordInput.setCustomValidity('Password tidak sama')
        } else {
          confirmPasswordInput.setCustomValidity('')
        }
      }

      passwordInput.addEventListener('input', validatePassword)
      confirmPasswordInput.addEventListener('input', validatePassword)

      return () => {
        passwordInput.removeEventListener('input', validatePassword)
        confirmPasswordInput.removeEventListener('input', validatePassword)
      }
    }
    return undefined
  }, [isOpen])

  const handleSubmit = async (_prev: unknown, formData: FormData) => {
    // Check if component is still mounted
    if (!isMountedRef.current) {
      return undefined
    }

    // Extract form values to preserve them in case of error
    const submittedValues = {
      username: formData.get('username') as string,
      fullName: formData.get('fullName') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string
    }

    // Client-side validation for required regions
    if (selectedAccessLevel === 3 && !selectedRegionId) {
      showErrorToast('PLKB Kecamatan harus ditempatkan di wilayah kecamatan.')
      // Preserve form values even on client-side validation error
      setFormValues(submittedValues)
      return undefined
    }

    if (selectedAccessLevel === 2 && !selectedRegionId) {
      showErrorToast('Kader DASHAT harus ditempatkan di wilayah desa.')
      // Preserve form values even on client-side validation error
      setFormValues(submittedValues)
      return undefined
    }

    const { data, error } = await actions.user.upsert(formData)

    // Check again if component is still mounted after async operation
    if (!isMountedRef.current) {
      return undefined
    }

    if (error && !data) {
      // Preserve form values when there's an error
      setFormValues(submittedValues)

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

    // Check once more before updating state
    if (!isMountedRef.current) {
      return undefined
    }

    // Refresh the users list
    const updatedUsers = await actions.user.getAll.orThrow({
      page: currentPage,
      size: 10
    })
    setUsers(updatedUsers)
    setCurrentUser(undefined)
    // Clear form values on successful submission
    setFormValues({})
    showSuccessToast(
      currentUser?.id
        ? 'Data pengguna berhasil diperbarui!'
        : 'Pengguna baru berhasil ditambahkan!'
    )
    return undefined
  }

  const [error, action, isPending] = useActionState(handleSubmit, null)

  if (!isOpen) {
    return <></>
  }

  return (
    <DialogComponent
      title={isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}
      description={
        isEdit
          ? 'Ubah informasi pengguna yang sudah ada. Username tidak dapat diubah setelah akun dibuat.'
          : 'Lengkapi formulir berikut untuk menambah pengguna baru. Semua field yang ditandai wajib diisi.'
      }
      open={isOpen}
      onOpenChange={(open) => !open && setCurrentUser(undefined)}
    >
      <form action={action} className='flex flex-col gap-6' noValidate={false}>
        {isEdit && <input type='hidden' name='id' value={currentUser.id} />}
        {isEdit && (
          <input type='hidden' name='accessLevel' value={selectedAccessLevel} />
        )}
        {isEdit && (
          <input type='hidden' name='username' value={currentUser.username} />
        )}
        {removeExistingImage && (
          <input type='hidden' name='removeProfilePhoto' value='true' />
        )}

        {/* Basic Information Section */}
        <fieldset className='border-primary/20 from-primary/5 to-primary/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
          <legend className='border-primary/30 bg-base-100 text-primary flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
            <UsersIcon className='h-5 w-5' />
            Informasi Dasar
          </legend>

          <div className='space-y-4'>
            <div>
              <label className='label' htmlFor='username'>
                <span className='label-text font-medium'>Username</span>
              </label>
              <input
                className={`input input-bordered validator w-full transition-all duration-200 ${
                  isEdit
                    ? 'bg-base-200 border-primary/30 text-base-content/60 cursor-not-allowed'
                    : 'border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 focus:ring-2'
                }`}
                type='text'
                id='username'
                name='username'
                defaultValue={
                  formValues.username ?? currentUser?.username ?? ''
                }
                required={!isEdit}
                disabled={isPending || !!isEdit}
                placeholder={
                  isEdit ? 'Username tidak dapat diubah' : 'Masukkan username'
                }
                autoComplete='username'
                pattern='[a-z0-9]{4,}'
                title={
                  isEdit
                    ? 'Username tidak dapat diubah setelah dibuat'
                    : 'Username harus terdiri dari huruf kecil dan angka, minimal 4 karakter'
                }
                readOnly={!!isEdit}
              />
              {error?.fields?.username && (
                <div className='label'>
                  <span className='label-text-alt text-error'>
                    {error.fields.username.join(', ')}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className='label' htmlFor='fullName'>
                <span className='label-text font-medium'>Nama Lengkap</span>
              </label>
              <input
                className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
                type='text'
                id='fullName'
                name='fullName'
                defaultValue={
                  formValues.fullName ?? currentUser?.fullName ?? ''
                }
                required
                disabled={isPending}
                placeholder='Masukkan nama lengkap'
                autoComplete='name'
                pattern='[a-zA-Z\s]+'
                title='Nama lengkap hanya boleh berisi huruf dan spasi'
              />
              {error?.fields?.fullName && (
                <div className='label'>
                  <span className='label-text-alt text-error'>
                    {error.fields.fullName.join(', ')}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className='label' htmlFor='phoneNumber'>
                <span className='label-text font-medium'>Nomor Telepon</span>
              </label>
              <input
                className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
                type='tel'
                id='phoneNumber'
                name='phoneNumber'
                defaultValue={
                  formValues.phoneNumber ?? currentUser?.phoneNumber ?? ''
                }
                disabled={isPending}
                placeholder='08xxx'
                autoComplete='tel'
                pattern='08[0-9]{8,}'
                title='Nomor telepon harus dimulai dengan 08 dan berisi minimal 10 digit'
              />
              {error?.fields?.phoneNumber && (
                <div className='label'>
                  <span className='label-text-alt text-error'>
                    {error.fields.phoneNumber.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* Access Level Section */}
        <fieldset className='border-info/20 from-info/5 to-info/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
          <legend className='border-info/30 bg-base-100 text-info flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
            <KeyIcon className='h-5 w-5' />
            Level Akses
          </legend>

          <div>
            {isEdit ? (
              // Show current access level as read-only for editing
              <div className='card from-base-100 to-base-200/50 border-base-300 border bg-gradient-to-br shadow-sm'>
                <div className='card-body p-4'>
                  <div className='flex items-start gap-4'>
                    {(() => {
                      const IconComponent =
                        getAccessLevelIcon(selectedAccessLevel)
                      return (
                        <IconComponent
                          className={`mt-0.5 h-6 w-6 ${getAccessLevelColor(selectedAccessLevel)}`}
                        />
                      )
                    })()}
                    <div>
                      <div className='text-base-content font-bold'>
                        {getAccessLevelName(selectedAccessLevel)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Show radio buttons for new users
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {filteredAccessLevels.map((level) => {
                  const IconComponent = getAccessLevelIcon(level)
                  return (
                    <label
                      key={level}
                      className={`card cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        selectedAccessLevel === level
                          ? 'from-primary/10 to-primary/5 border-primary ring-primary/20 bg-gradient-to-br shadow-lg ring-2'
                          : 'from-base-100 to-base-200/50 border-base-300 hover:border-primary/50 bg-gradient-to-br hover:shadow-md'
                      }`}
                    >
                      <div className='card-body p-6'>
                        <input
                          type='radio'
                          name='accessLevel'
                          value={level}
                          checked={selectedAccessLevel === level}
                          onChange={(e) =>
                            setSelectedAccessLevel(Number(e.target.value))
                          }
                          disabled={isPending}
                          className='sr-only'
                        />
                        <div className='flex flex-col items-center gap-2 text-center'>
                          <IconComponent
                            className={`h-6 w-6 ${getAccessLevelColor(level)}`}
                          />
                          <span className='text-sm font-medium'>
                            {getAccessLevelName(level)}
                          </span>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
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
        </fieldset>

        {/* Profile Photo Section */}
        <fieldset className='border-success/20 from-success/5 to-success/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
          <legend className='border-success/30 bg-base-100 text-success flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
            <CameraIcon className='h-5 w-5' />
            Foto Profil
          </legend>

          <div className='card from-base-100 to-base-200/50 border-base-300 border bg-gradient-to-br shadow-sm'>
            <div className='card-body p-6'>
              <div className='flex flex-col gap-6'>
                {/* Current or Preview Image Display - only show if there's an image */}
                {(selectedFile ||
                  (currentUser?.profilePhoto && !removeExistingImage)) && (
                  <div className='flex justify-center'>
                    {selectedFile && previewUrl ? (
                      // Show new selected image with visual cue
                      <div className='relative'>
                        <img
                          src={previewUrl}
                          alt='New profile photo preview'
                          className='ring-success/30 border-success h-40 w-40 rounded-full border-4 object-cover shadow-lg ring-4'
                        />
                        <div className='bg-success absolute -right-2 -bottom-2 flex h-10 w-10 animate-pulse items-center justify-center rounded-full border-4 border-white shadow-lg'>
                          <CameraIcon className='h-5 w-5 text-white' />
                        </div>
                        <div className='bg-success text-success-content absolute -top-2 left-1/2 -translate-x-1/2 transform rounded-full px-3 py-1 text-xs font-bold shadow-lg'>
                          BARU
                        </div>
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedFile(null)
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl)
                              setPreviewUrl(null)
                            }
                          }}
                          className='bg-error hover:bg-error/80 absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg transition-colors'
                          disabled={isPending}
                        >
                          <XIcon className='h-4 w-4 text-white' />
                        </button>
                      </div>
                    ) : selectedFile ? (
                      // Show file selected feedback without preview
                      <div className='from-success/10 to-success/20 border-success/20 w-full rounded-lg border bg-gradient-to-r p-4'>
                        <div className='text-center'>
                          <div className='text-success mb-2 text-lg font-bold'>
                            📁 File Dipilih
                          </div>
                          <div className='text-success text-base font-medium'>
                            {selectedFile.name}
                          </div>
                        </div>
                      </div>
                    ) : currentUser?.profilePhoto && !removeExistingImage ? (
                      // Show existing image only when no new file is selected and not marked for removal
                      <div className='relative'>
                        <Image
                          publicId={currentUser.profilePhoto}
                          width={160}
                          height={160}
                          sizes='160px'
                          breakpoints={[128, 160, 256]}
                          className='ring-primary/20 h-40 w-40 rounded-full border-4 border-white object-cover shadow-lg ring-2'
                          alt='Current profile photo'
                        />
                        <div className='bg-primary absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-lg'>
                          <CameraIcon className='h-5 w-5 text-white' />
                        </div>
                        <button
                          type='button'
                          onClick={handleRemoveExistingImage}
                          className='bg-error hover:bg-error/80 absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg transition-colors'
                          disabled={isPending}
                        >
                          <XIcon className='h-4 w-4 text-white' />
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className='flex flex-col items-center gap-4'>
                  <div className='from-primary/10 to-primary/20 border-primary/20 hover:from-primary/20 hover:to-primary/30 hover:border-primary/40 flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed bg-gradient-to-br transition-all duration-300'>
                    <label
                      htmlFor='profilePhotoFile'
                      className='flex cursor-pointer flex-col items-center gap-2'
                    >
                      <UploadIcon className='text-primary h-8 w-8' />
                      <span className='text-base-content text-sm font-medium'>
                        Klik untuk pilih foto atau seret & lepas
                      </span>
                      <span className='text-base-content/70 text-xs'>
                        {selectedFile
                          ? selectedFile.name
                          : currentUser?.profilePhoto
                            ? 'Ganti foto yang sudah ada'
                            : 'Format: JPG, PNG, WebP (Maks 5MB)'}
                      </span>
                    </label>
                  </div>

                  <input
                    className='validator sr-only'
                    type='file'
                    id='profilePhotoFile'
                    name='profilePhotoFile'
                    accept='image/jpeg,image/png,image/webp,image/jpg'
                    disabled={isPending}
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              {error?.fields?.profilePhotoFile && (
                <div className='text-error mt-3 text-sm'>
                  {error.fields.profilePhotoFile.join(', ')}
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* Password Section */}
        <fieldset className='border-warning/20 from-warning/5 to-warning/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
          <legend className='border-warning/30 bg-base-100 text-warning flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
            <LockIcon className='h-5 w-5' />
            {isEdit ? 'Ubah Password (opsional)' : 'Password'}
          </legend>

          <div className='card from-base-100 to-base-200/50 border-base-300 border bg-gradient-to-br shadow-sm'>
            <div className='card-body space-y-4 p-6'>
              <div>
                <label className='label' htmlFor='password'>
                  <span className='label-text font-medium'>
                    Password {!isEdit && <span className='text-error'>*</span>}
                  </span>
                </label>
                <input
                  className='input input-bordered border-warning/30 bg-base-100 focus:border-warning focus:ring-warning/20 validator w-full transition-all duration-200 focus:ring-2'
                  type='password'
                  id='password'
                  name='password'
                  defaultValue={formValues.password ?? ''}
                  minLength={8}
                  required={!isEdit}
                  disabled={isPending}
                  placeholder='Masukkan password minimal 8 karakter'
                  autoComplete={isEdit ? 'new-password' : 'new-password'}
                />
                {error?.fields?.password && (
                  <div className='label'>
                    <span className='label-text-alt text-error'>
                      {error.fields.password.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className='label' htmlFor='confirmPassword'>
                  <span className='label-text font-medium'>
                    Konfirmasi Password{' '}
                    {!isEdit && <span className='text-error'>*</span>}
                  </span>
                </label>
                <input
                  className='input input-bordered bg-base-100 border-base-300 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
                  type='password'
                  id='confirmPassword'
                  name='confirmPassword'
                  defaultValue={formValues.confirmPassword ?? ''}
                  minLength={8}
                  required={!isEdit}
                  disabled={isPending}
                  placeholder='Ulangi password yang sama'
                  autoComplete='new-password'
                />
                {error?.fields?.confirmPassword && (
                  <div className='label'>
                    <span className='label-text-alt text-error'>
                      {error.fields.confirmPassword.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className='border-base-300 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end'>
          <button
            type='button'
            className='btn btn-ghost border-base-300 hover:border-base-400 hover:bg-base-200 border transition-all duration-200'
            onClick={() => setCurrentUser(undefined)}
            disabled={isPending}
          >
            <XIcon className='h-4 w-4' />
            Batal
          </button>
          <button
            type='submit'
            className={`btn border transition-all duration-200 hover:scale-105 ${
              isPending
                ? 'bg-base-200 border-base-300 text-base-content/50 cursor-not-allowed'
                : 'from-primary to-primary/80 border-primary/30 text-primary-content hover:shadow-primary/25 bg-gradient-to-r hover:shadow-lg'
            }`}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <LoaderIcon className='h-4 w-4 animate-spin' />
                Menyimpan...
              </>
            ) : (
              <>
                <SaveIcon className='h-4 w-4' />
                {isEdit ? 'Update' : 'Tambah'}
              </>
            )}
          </button>
        </div>
      </form>
    </DialogComponent>
  )
}

export default UserDialog
