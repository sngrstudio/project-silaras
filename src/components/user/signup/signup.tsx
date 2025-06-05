import { useActionState, useRef, useEffect, useState, type FC } from 'react'
import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'
import UserIcon from '~icons/lucide/user'
import LockIcon from '~icons/lucide/lock'
import UserPlusIcon from '~icons/lucide/user-plus'
import PhoneIcon from '~icons/lucide/phone'
import IdCardIcon from '~icons/lucide/id-card'
import LoaderIcon from '~icons/lucide/loader'
import LogInIcon from '~icons/lucide/log-in'

const SignupFormRC: FC<{ first?: boolean | undefined }> = ({ first }) => {
  const formRef = useRef<HTMLFormElement>(null)
  const [regionId, setRegionId] = useState<string | undefined>(undefined)

  // Fetch KABUPATEN region ID when first is true (first administrator signup)
  useEffect(() => {
    if (first) {
      actions.region.getByType
        .orThrow({ type: 'KABUPATEN' })
        .then(([region]) => setRegionId(region?.id ?? undefined))
    }
  }, [first])

  // Handle form validation
  useEffect(() => {
    const usernameInput = document.getElementById(
      'username'
    ) as HTMLInputElement
    const passwordInput = document.getElementById(
      'password'
    ) as HTMLInputElement
    const confirmPasswordInput = document.getElementById(
      'confirmPassword'
    ) as HTMLInputElement
    const phoneInput = document.getElementById(
      'phoneNumber'
    ) as HTMLInputElement
    const fullNameInput = document.getElementById(
      'fullName'
    ) as HTMLInputElement

    if (
      usernameInput &&
      passwordInput &&
      confirmPasswordInput &&
      phoneInput &&
      fullNameInput
    ) {
      const validateUsername = () => {
        if (
          usernameInput.value.length > 0 &&
          !/^[a-z0-9]{4,}$/.test(usernameInput.value)
        ) {
          usernameInput.setCustomValidity(
            'Username harus terdiri dari huruf kecil dan angka, minimal 4 karakter'
          )
        } else {
          usernameInput.setCustomValidity('')
        }
      }

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

      const validatePhone = () => {
        if (
          phoneInput.value &&
          !/^(\+62|62|0)[0-9]{9,12}$/.test(phoneInput.value)
        ) {
          phoneInput.setCustomValidity(
            'Nomor telepon harus dalam format Indonesia yang valid'
          )
        } else {
          phoneInput.setCustomValidity('')
        }
      }

      const validateFullName = () => {
        if (
          fullNameInput.value.length > 0 &&
          !/^[a-zA-Z\s]+$/.test(fullNameInput.value)
        ) {
          fullNameInput.setCustomValidity(
            'Nama lengkap hanya boleh berisi huruf dan spasi'
          )
        } else {
          fullNameInput.setCustomValidity('')
        }
      }

      usernameInput.addEventListener('input', validateUsername)
      passwordInput.addEventListener('input', validatePassword)
      confirmPasswordInput.addEventListener('input', validatePassword)
      phoneInput.addEventListener('input', validatePhone)
      fullNameInput.addEventListener('input', validateFullName)

      return () => {
        usernameInput.removeEventListener('input', validateUsername)
        passwordInput.removeEventListener('input', validatePassword)
        confirmPasswordInput.removeEventListener('input', validatePassword)
        phoneInput.removeEventListener('input', validatePhone)
        fullNameInput.removeEventListener('input', validateFullName)
      }
    }
    return undefined
  }, [])

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
              'Username yang Anda pilih sudah digunakan. Silakan pilih username lain.'
            )
          } else if (error.message.includes('Nomor telepon')) {
            showErrorToast(
              'Nomor telepon yang Anda masukkan sudah digunakan oleh pengguna lain.'
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
            'Anda tidak memiliki izin untuk melakukan pendaftaran ini.'
          )
          break
        case 'INTERNAL_SERVER_ERROR':
          showErrorToast(
            'Terjadi masalah pada server. Silakan coba lagi nanti.'
          )
          break
        default:
          showErrorToast('Terjadi kesalahan saat mendaftar. Silakan coba lagi.')
      }
      return undefined
    }

    showSuccessToast('Pendaftaran berhasil! Mengarahkan ke halaman login...')
    setTimeout(() => navigate(`/user/login/?user=${data?.username}`), 1000)
    return undefined
  }

  const [error, action, isPending] = useActionState(handleForm, undefined)

  return (
    <form
      className='flex w-full flex-col gap-6'
      action={action}
      ref={formRef}
      noValidate={false}
    >
      {/* Basic Information Section */}
      <fieldset className='border-primary/20 from-primary/5 to-primary/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
        <legend className='border-primary/30 bg-base-100 text-primary flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
          <UserIcon className='h-5 w-5' />
          Informasi Dasar
        </legend>

        <div className='space-y-4'>
          <div>
            <label className='label' htmlFor='username'>
              <span className='label-text flex items-center gap-2 font-medium'>
                <UserIcon className='text-base-content/60 h-4 w-4' />
                Username <span className='text-error'>*</span>
              </span>
            </label>
            <input
              className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
              type='text'
              id='username'
              name='username'
              required
              disabled={isPending}
              placeholder='Masukkan username (huruf kecil & angka)'
              autoComplete='username'
              pattern='[a-z0-9]{4,}'
              title='Username harus terdiri dari huruf kecil dan angka, minimal 4 karakter'
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
              <span className='label-text flex items-center gap-2 font-medium'>
                <IdCardIcon className='text-base-content/60 h-4 w-4' />
                Nama Lengkap <span className='text-error'>*</span>
              </span>
            </label>
            <input
              className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
              type='text'
              id='fullName'
              name='fullName'
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
              <span className='label-text flex items-center gap-2 font-medium'>
                <PhoneIcon className='text-base-content/60 h-4 w-4' />
                Nomor Telepon
              </span>
            </label>
            <input
              className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
              type='tel'
              id='phoneNumber'
              name='phoneNumber'
              disabled={isPending}
              placeholder='Contoh: 08123456789 atau +6281234567890'
              autoComplete='tel'
              pattern='(\+62|62|0)[0-9]{9,12}'
              title='Nomor telepon harus dalam format Indonesia yang valid'
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

      {/* Password Section */}
      <fieldset className='border-warning/20 from-warning/5 to-warning/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
        <legend className='border-warning/30 bg-base-100 text-warning flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
          <LockIcon className='h-5 w-5' />
          Password
        </legend>

        <div className='space-y-4'>
          <div>
            <label className='label' htmlFor='password'>
              <span className='label-text flex items-center gap-2 font-medium'>
                <LockIcon className='text-base-content/60 h-4 w-4' />
                Password <span className='text-error'>*</span>
              </span>
            </label>
            <input
              className='input input-bordered border-warning/30 bg-base-100 focus:border-warning focus:ring-warning/20 validator w-full transition-all duration-200 focus:ring-2'
              type='password'
              id='password'
              name='password'
              required
              minLength={8}
              disabled={isPending}
              placeholder='Masukkan password minimal 8 karakter'
              autoComplete='new-password'
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
              <span className='label-text flex items-center gap-2 font-medium'>
                <LockIcon className='text-base-content/60 h-4 w-4' />
                Konfirmasi Password <span className='text-error'>*</span>
              </span>
            </label>
            <input
              className='input input-bordered bg-base-100 border-base-300 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              required
              minLength={8}
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
      </fieldset>

      <input type='hidden' name='accessLevel' value={first ? 5 : 2} />
      {first && regionId && (
        <input type='hidden' name='regionId' value={regionId} />
      )}

      {/* Action Buttons */}
      <div className='border-base-300 flex flex-col gap-3 border-t pt-6'>
        <button
          className={`btn border transition-all duration-200 hover:scale-105 ${
            isPending
              ? 'bg-base-200 border-base-300 text-base-content/50 cursor-not-allowed'
              : 'from-primary to-primary/80 border-primary/30 text-primary-content hover:shadow-primary/25 bg-gradient-to-r hover:shadow-lg'
          }`}
          type='submit'
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LoaderIcon className='h-4 w-4 animate-spin' />
              Sedang Mendaftar...
            </>
          ) : (
            <>
              <UserPlusIcon className='h-4 w-4' />
              Daftar
            </>
          )}
        </button>
        {!first && (
          <a
            className='btn btn-ghost border-base-300 hover:border-base-400 hover:bg-base-200 border transition-all duration-200'
            href='/user/login'
          >
            <LogInIcon className='h-4 w-4' />
            Sudah mendaftar?
          </a>
        )}
      </div>
    </form>
  )
}

export default SignupFormRC
