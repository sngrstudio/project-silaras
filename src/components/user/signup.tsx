import { type FC, useRef, useEffect } from 'react'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

const SignUpForm: FC = () => {
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    ref.current?.addEventListener('submit', async (event) => {
      event.preventDefault()

      const formData = new FormData(ref.current!)
      const { error } = await actions.auth.signup(formData)
      if (!error) navigate('/user/login')
      console.log(error)
    })
  }, [])

  return (
    <form ref={ref}>
      <label>
        <span>Username</span>
        <input name='userName' type='text' autoComplete='username' required />
      </label>
      <label>
        <span>Password</span>
        <input
          name='password'
          type='password'
          autoComplete='new-password'
          required
        />
      </label>
      <label>
        <span>Konfirmasi Password</span>
        <input
          name='confirmPassword'
          type='password'
          autoComplete='new-password'
          required
        />
      </label>
      <label>
        <input type='submit' value='Buat akun' />
      </label>
    </form>
  )
}

export default SignUpForm
