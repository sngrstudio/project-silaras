import { useActionState, useRef, type FC } from 'react'
import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

const LoginForm: FC = () => {
  const formRef = useRef<HTMLFormElement>(null)

  const handleForm = async (_prev: unknown, formData: FormData) => {
    const { error } = await actions.user.auth.login(formData)

    if (error) {
      if (isInputError(error)) {
        return error
      }
      console.error(error)
      return undefined
    }

    // Redirect to dashboard on successful login
    navigate('/')
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

      <div className='flex w-full flex-col-reverse md:flex-row-reverse'>
        <button
          className='btn btn-primary max-md:w-full'
          type='submit'
          disabled={isPending}
        >
          Login
        </button>
      </div>
    </form>
  )
}

export default LoginForm
