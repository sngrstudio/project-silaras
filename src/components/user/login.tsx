import { type FC, useRef, useEffect } from 'react'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

const LoginForm: FC = () => {
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    ref.current?.addEventListener('submit', async (event) => {
      event.preventDefault()

      const formData = new FormData(ref.current!)
      const { error } = await actions.auth.login(formData)
      if (!error) navigate('/')
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
          autoComplete='current-password'
          required
        />
      </label>
      <label>
        <input type='submit' value='Login' />
      </label>
    </form>
  )
}

export default LoginForm
