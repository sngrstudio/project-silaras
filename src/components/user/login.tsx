import { type FC, useActionState } from 'react'
import { FormLabel } from './components'
import { actions, isInputError } from 'astro:actions'
import { useStore } from '@nanostores/react'
import { $showToast, setToastMessage } from '~/components/toast/store'
import { navigate } from 'astro:transitions/client'

interface LoginRCProps {
  username?: string | undefined
}

const LoginRC: FC<LoginRCProps> = ({ username }) => {
  const showToast = useStore($showToast)

  const handleSignup = async (_: any, formData: FormData) => {
    const { error } = await actions.user.login(formData)
    if (error) {
      if (isInputError(error)) {
        return error
      }

      setToastMessage({
        error: true,
        message: error.message
      })
      return undefined
    }

    setToastMessage({
      message: 'Sedang masuk...'
    })

    if (!showToast) {
      navigate('/')
    }
    return undefined
  }

  const [error, submitAction, isPending] = useActionState(
    handleSignup,
    undefined
  )

  return (
    <form action={submitAction} className='flex w-full flex-col gap-4'>
      <FormLabel label='Username'>
        <input
          className='input input-lg validator w-full'
          type='text'
          name='userName'
          defaultValue={username}
          placeholder='Username'
          disabled={isPending}
          autoComplete='username'
          required
        />
        {error && error.fields.userName && (
          <span className='text-error'>
            {error.fields.userName.join(' | ')}
          </span>
        )}
      </FormLabel>

      <FormLabel label='Password'>
        <input
          className='input input-lg validator w-full'
          type='password'
          name='password'
          placeholder='Password'
          disabled={isPending}
          autoComplete='new-password'
          required
        />
        {error && error.fields.password && (
          <span className='text-error'>
            {error.fields.password.join(' | ')}
          </span>
        )}
      </FormLabel>

      <div className='mt-6 flex flex-col gap-2'>
        <input
          className='btn btn-primary'
          type='submit'
          value='Login'
          disabled={isPending}
        />
        <a className='btn btn-link' href='/user/login'>
          Buat akun
        </a>
      </div>
    </form>
  )
}

export default LoginRC
