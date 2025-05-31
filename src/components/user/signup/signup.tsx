import { useActionState, useRef, type FC } from 'react'
import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

const SignupFormRC: FC<{ first?: boolean | undefined }> = ({ first }) => {
  const formRef = useRef<HTMLFormElement>(null)

  const handleForm = async (_prev: unknown, formData: FormData) => {
    const { error, data } = await actions.user.upsert(formData)

    if (error && !data) {
      if (isInputError(error)) {
        return error
      }
      console.error(error)
      return undefined
    }

    navigate(`/user/login/?user=${data?.username}`)
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
          minLength={8}
          disabled={isPending}
        />
      </div>

      <div>
        <label className='label' htmlFor='confirmPassword'>
          Confirm Password
        </label>
        <input
          className='input md:input-lg w-full'
          type='password'
          id='confirmPassword'
          name='confirmPassword'
          required
          minLength={8}
          disabled={isPending}
        />
      </div>

      <div>
        <label className='label' htmlFor='fullName'>
          Full Name
        </label>
        <input
          className='input md:input-lg w-full'
          type='text'
          id='fullName'
          name='fullName'
          required
          disabled={isPending}
        />
      </div>

      <div>
        <label className='label' htmlFor='phoneNumber'>
          Phone Number
        </label>
        <input
          className='input md:input-lg w-full'
          type='tel'
          id='phoneNumber'
          name='phoneNumber'
          disabled={isPending}
        />
      </div>

      <input type='hidden' name='accessLevel' value={first ? 4 : 2} />

      <div className='mt-6 flex w-full flex-col-reverse gap-y-2'>
        <button
          className='btn btn-primary w-full'
          type='submit'
          disabled={isPending}
        >
          Daftar
        </button>
        {!first && (
          <a className='btn btn-link' href='/user/login'>
            Sudah mendaftar?
          </a>
        )}
      </div>
    </form>
  )
}

export default SignupFormRC
