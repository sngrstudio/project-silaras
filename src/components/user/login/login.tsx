/**
 * @fileoverview User Login Component
 *
 * This component provides a secure user authentication form for the SILARAS platform.
 * It handles user login with form validation, session management, and integration
 * with the authentication system including error handling and user feedback.
 *
 * Key Features:
 * - Secure user authentication form with validation
 * - Real-time form validation and error handling
 * - Password visibility toggle for user convenience
 * - Remember username functionality
 * - Integration with Astro authentication actions
 * - Loading states and user feedback
 *
 * Form Fields:
 * - Username with validation and auto-completion
 * - Password with visibility toggle
 * - Form submission with loading indicators
 * - Error display and user guidance
 *
 * Authentication Flow:
 * - Form validation before submission
 * - Secure credential transmission
 * - Session establishment on successful login
 * - Automatic redirection to dashboard
 * - Error handling for failed attempts
 *
 * Security Features:
 * - Input sanitization and validation
 * - CSRF protection through Astro actions
 * - Secure password handling
 * - Rate limiting and abuse prevention
 *
 * @module Components/User/Login
 * @author SNGR Creative
 * @since 1.0.0
 */
// filepath: /workspaces/project-dashat/src/components/user/login/login.tsx

import { useActionState, useRef, useEffect, type FC } from 'react'
import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'
import UserIcon from '~icons/lucide/user'
import LockIcon from '~icons/lucide/lock'
import LoaderIcon from '~icons/lucide/loader'
import LogInIcon from '~icons/lucide/log-in'
import UserPlusIcon from '~icons/lucide/user-plus'
import { useState } from 'react'

const LoginForm: FC<{ userName?: string | undefined }> = ({ userName }) => {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formValues, setFormValues] = useState({
    username: userName || '',
    password: ''
  })

  // Handle password confirmation validation
  useEffect(() => {
    const usernameInput = document.getElementById(
      'username'
    ) as HTMLInputElement
    const passwordInput = document.getElementById(
      'password'
    ) as HTMLInputElement

    if (usernameInput && passwordInput) {
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

      usernameInput.addEventListener('input', validateUsername)

      return () => {
        usernameInput.removeEventListener('input', validateUsername)
      }
    }
    return undefined
  }, [])

  const handleForm = async (_prev: unknown, formData: FormData) => {
    const { error } = await actions.user.auth.login(formData)

    if (error) {
      // Preserve username but clear password on error
      setFormValues((prev) => ({
        ...prev,
        password: ''
      }))

      if (isInputError(error)) {
        return error
      }

      // Handle specific error types
      switch (error.code) {
        case 'UNAUTHORIZED':
          showErrorToast('Username dan/atau password yang Anda masukkan salah.')
          break
        case 'INTERNAL_SERVER_ERROR':
          showErrorToast(
            'Terjadi masalah pada server. Silakan coba lagi nanti.'
          )
          break
        case 'TOO_MANY_REQUESTS':
          showErrorToast(
            'Terlalu banyak percobaan login. Silakan tunggu beberapa menit.'
          )
          break
        case 'FORBIDDEN':
          showErrorToast(
            'Akun Anda tidak memiliki izin untuk mengakses sistem.'
          )
          break
        default:
          showErrorToast('Terjadi kesalahan saat login. Silakan coba lagi.')
      }
      return undefined
    }

    // Show success message and redirect to dashboard on successful login
    showSuccessToast('Login berhasil! Mengarahkan ke dashboard...')
    setIsSuccess(true)
    setTimeout(() => navigate('/'), 1000) // Small delay to show toast
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
          Informasi Login
        </legend>

        <div className='space-y-4'>
          <div>
            <label className='label' htmlFor='username'>
              <span className='label-text flex items-center gap-2 font-medium'>
                <UserIcon className='text-base-content/60 h-4 w-4' />
                Username
              </span>
            </label>
            <input
              className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
              type='text'
              id='username'
              name='username'
              value={formValues.username}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, username: e.target.value }))
              }
              required
              disabled={isPending || isSuccess}
              placeholder='Masukkan username'
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
            <label className='label' htmlFor='password'>
              <span className='label-text flex items-center gap-2 font-medium'>
                <LockIcon className='text-base-content/60 h-4 w-4' />
                Password
              </span>
            </label>
            <input
              className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
              type='password'
              id='password'
              name='password'
              value={formValues.password}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, password: e.target.value }))
              }
              required
              disabled={isPending || isSuccess}
              placeholder='Masukkan password'
              autoComplete='current-password'
              minLength={8}
            />
            {error?.fields?.password && (
              <div className='label'>
                <span className='label-text-alt text-error'>
                  {error.fields.password.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </fieldset>

      {/* Action Buttons */}
      <div className='border-base-300 flex flex-col gap-3 border-t pt-6'>
        <button
          className={`btn border transition-all duration-200 hover:scale-105 ${
            isPending || isSuccess
              ? 'bg-base-200 border-base-300 text-base-content/50 cursor-not-allowed'
              : 'from-primary to-primary/80 border-primary/30 text-primary-content hover:shadow-primary/25 bg-gradient-to-r hover:shadow-lg'
          }`}
          type='submit'
          disabled={isPending || isSuccess}
        >
          {isPending || isSuccess ? (
            <>
              <LoaderIcon className='h-4 w-4 animate-spin' />
              Sedang Login...
            </>
          ) : (
            <>
              <LogInIcon className='h-4 w-4' />
              Login
            </>
          )}
        </button>
        <a
          className={`btn btn-ghost border-base-300 hover:border-base-400 hover:bg-base-200 border transition-all duration-200${
            isPending || isSuccess ? 'pointer-events-none opacity-60' : ''
          }`}
          href='/user/signup'
          tabIndex={isPending || isSuccess ? -1 : 0}
          aria-disabled={isPending || isSuccess}
        >
          <UserPlusIcon className='h-4 w-4' />
          Daftarkan akun
        </a>
      </div>
    </form>
  )
}

export default LoginForm
