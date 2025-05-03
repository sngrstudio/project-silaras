import { type FC, useActionState } from 'react'
import UserLoginSignupCard, { type UserLoginSignupCardProps } from './card'
import { Form } from 'radix-ui'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import {
  $showToast as showToast,
  $toastMessage as toastMessage
} from '../toast/store'

interface LoginRCProps extends UserLoginSignupCardProps {}

const LoginRC: FC<LoginRCProps> = ({ title }) => {
  const [_error, submitAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      const { error } = await actions.auth.login(formData)
      if (error) {
        showToast.set(true)
        toastMessage.set({
          error: true,
          message: error.message
        })
        return error
      } else {
        showToast.set(true)
        toastMessage.set({
          error: false,
          message: 'Sedang masuk...'
        })
        showToast.subscribe((show) => {
          if (!show) {
            navigate('/')
          }
        })

        return null
      }
    },
    null
  )

  return (
    <UserLoginSignupCard title={title}>
      <Form.Root action={submitAction} className='flex flex-col gap-3'>
        {/* username */}
        <Form.Field name='userName' asChild>
          <label className='floating-label'>
            <Form.Label asChild>
              <span>Username</span>
            </Form.Label>
            <Form.Control
              className='input input-lg'
              placeholder='Username'
              required
            ></Form.Control>
          </label>
        </Form.Field>

        {/* password */}
        <Form.Field name='password' asChild>
          <label className='floating-label'>
            <Form.Label asChild>
              <span>Password</span>
            </Form.Label>
            <Form.Control
              className='input input-lg'
              placeholder='Password'
              type='password'
              required
            ></Form.Control>
          </label>
        </Form.Field>

        {/* the submit button */}
        <Form.Submit className='btn btn-primary mt-6' disabled={isPending}>
          Login
        </Form.Submit>
        <a className='btn btn-link' href='/user/signup' role='button'>
          Belum ada akun?
        </a>
      </Form.Root>
    </UserLoginSignupCard>
  )
}

export default LoginRC
