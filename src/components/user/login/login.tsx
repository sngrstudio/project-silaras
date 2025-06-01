import { useActionState, useRef, type FC } from 'react'
import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'

const LoginForm: FC<{ userName?: string | undefined }> = ({ userName }) => {
  const formRef = useRef<HTMLFormElement>(null)

  const handleForm = async (_prev: unknown, formData: FormData) => {
    const { error } = await actions.user.auth.login(formData)

    if (error) {
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
    setTimeout(() => navigate('/'), 1000) // Small delay to show toast
    return undefined
  }

  const [_error, action, isPending] = useActionState(handleForm, undefined)

  return (
    <form
      className='flex w-full flex-col gap-y-4'
      action={action}
      ref={formRef}
    >
      <div>
        <label className='label' htmlFor='username'>
          Username
        </label>
        <input
          className='input md:input-lg w-full'
          type='text'
          id='username'
          name='username'
          defaultValue={userName}
          required
          disabled={isPending}
        />
      </div>

      <div>
        <label className='label' htmlFor='password'>
          Password
        </label>
        <input
          className='input md:input-lg w-full'
          type='password'
          id='password'
          name='password'
          required
          disabled={isPending}
        />
      </div>

      <div className='mt-4 flex w-full flex-col-reverse gap-y-2'>
        <button
          className='btn btn-primary w-full'
          type='submit'
          disabled={isPending}
        >
          Login
        </button>
        <a className='btn btn-link' href='/user/signup'>
          Daftarkan akun
        </a>
      </div>
    </form>
  )
}

export default LoginForm
