import { type FC, useActionState } from 'react'
import { FormLabel } from './form'
import { actions, isInputError } from 'astro:actions'
import { useStore } from '@nanostores/react'
import { $showToast, setToastMessage } from '~/components/layout/toast/store'
import { navigate } from 'astro:transitions/client'

interface SignupRCProps {
  first?: boolean | undefined
}

const SignupRC: FC<SignupRCProps> = ({ first }) => {
  const showToast = useStore($showToast)

  const handleSignup = async (_: any, formData: FormData) => {
    const { data, error } = await actions.user.create(formData)
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
      message: 'Mendaftarkan akun...'
    })

    if (!showToast) {
      navigate(`/user/login?user=${data?.userName}`)
    }
    return undefined
  }

  const [error, submitAction, isPending] = useActionState(
    handleSignup,
    undefined
  )

  return (
    <form action={submitAction} className='flex w-full flex-col gap-4'>
      <FormLabel label='Nama'>
        <input
          className='input input-lg validator w-full'
          type='text'
          name='fullName'
          placeholder='Nama'
          disabled={isPending}
          autoComplete='name'
          required
        />
        {error && error.fields.fullName && (
          <span className='text-error'>
            {error.fields.fullName.join(' | ')}
          </span>
        )}
      </FormLabel>

      <FormLabel label='Username'>
        <input
          className='input input-lg validator w-full'
          type='text'
          name='userName'
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

      <FormLabel label='Konfirmasi Password'>
        <input
          className='input input-lg validator w-full'
          type='password'
          name='confirmPassword'
          placeholder='Konfirmasi Password'
          disabled={isPending}
          autoComplete='new-password'
          required
        />
        {error && error.fields.confirmPassword && (
          <span className='text-error'>
            {error.fields.confirmPassword.join(' | ')}
          </span>
        )}
      </FormLabel>

      {/* by default, access level is 2 = User */}
      <input type='hidden' name='accessLevel' value={first ? 4 : 2} />

      {/* set createmode */}
      <input type='hidden' name='createMode' value='true' />

      <div className='mt-6 flex flex-col gap-2'>
        <input
          className='btn btn-primary'
          type='submit'
          value='Buat akunku'
          disabled={isPending}
        />
        <a className='btn btn-link' href='/user/login'>
          Sudah punya akun?
        </a>
      </div>
    </form>
  )
}

export default SignupRC
