import { useActionState, useRef, useEffect, useState, type FC } from 'react'
import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

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

  const [error, action, isPending] = useActionState(handleForm, undefined)

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
        {error?.fields?.username && (
          <div className='label text-error'>
            {error.fields.username.join(', ')}
          </div>
        )}
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
        {error?.fields?.password && (
          <div className='label text-error'>
            {error.fields.password.join(', ')}
          </div>
        )}
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
        {error?.fields?.confirmPassword && (
          <div className='label text-error'>
            {error.fields.confirmPassword.join(', ')}
          </div>
        )}
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
        {error?.fields?.fullName && (
          <div className='label text-error'>
            {error.fields.fullName.join(', ')}
          </div>
        )}
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
        {error?.fields?.phoneNumber && (
          <div className='label text-error'>
            {error.fields.phoneNumber.join(', ')}
          </div>
        )}
      </div>

      <input type='hidden' name='accessLevel' value={first ? 4 : 2} />
      {first && regionId && (
        <input type='hidden' name='regionId' value={regionId} />
      )}

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
