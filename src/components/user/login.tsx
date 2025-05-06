import { type FC, useActionState } from 'react'
import UserLoginSignupCard, { type UserLoginSignupCardProps } from './card'
import { Form } from 'radix-ui'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import { useStore } from '@nanostores/react'
import { setUserProfile } from '../layout/store'
import { $showToast, $toastMessage, setToastOn } from '../toast/store'

interface LoginRCProps extends UserLoginSignupCardProps {
  username?: string | undefined
}

const LoginRC: FC<LoginRCProps> = ({ title, username }) => {
  const toastMessage = useStore($toastMessage)
  const showToast = useStore($showToast)

  const [_error, submitAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      const { data: userName, error } = await actions.auth.login(formData)
      if (error) {
        setToastOn({
          error: true,
          message: error.message
        })
        return error
      }

      const userProfile = await actions.user.get.orThrow({ userName })
      setUserProfile(userProfile)
      setToastOn({
        message: 'Sedang masuk...'
      })
      if (!showToast) {
        navigate('/')
      }

      return null
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
              defaultValue={username}
              disabled={isPending || (toastMessage && !toastMessage.error)}
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
              disabled={isPending || (toastMessage && !toastMessage.error)}
              required
            ></Form.Control>
          </label>
        </Form.Field>

        {/* the submit button */}
        <Form.Submit
          className='btn btn-primary mt-6'
          disabled={isPending || (toastMessage && !toastMessage.error)}
        >
          <span
            className='loading loading-dots loading-xs mr-1 not-data-[show=true]:hidden'
            data-show={isPending || (toastMessage && !toastMessage.error)}
          ></span>
          <span>Login</span>
        </Form.Submit>
        <a className='btn btn-link' href='/user/signup' role='button'>
          Belum ada akun?
        </a>
      </Form.Root>
    </UserLoginSignupCard>
  )
}

export default LoginRC
