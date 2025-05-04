import { type FC, useActionState } from 'react'
import UserLoginSignupCard, { type UserLoginSignupCardProps } from './card'
import { Form } from 'radix-ui'
import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import {
  $showToast as showToast,
  $toastMessage as toastMessage
} from '../toast/store'

interface SignupRCProps extends UserLoginSignupCardProps {
  createAdmin?: boolean | undefined
  createViewer?: boolean | undefined
}

const SignupRC: FC<SignupRCProps> = ({ title, createAdmin, createViewer }) => {
  const [_error, submitAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      const { error } = await actions.auth.signup(formData)
      if (error) {
        const message = !isInputError(error)
          ? error.message
          : error.fields.userName
            ? error.fields.userName.join(', ')
            : error.fields.password
              ? error.fields.password.join(', ')
              : error.fields.confirmPassword
                ? error.fields.confirmPassword.join(', ')
                : 'Terjadi kesalahan yang tidak diketahui.'

        showToast.set(true)
        toastMessage.set({
          error: true,
          message
        })
        return error
      } else {
        showToast.set(true)
        toastMessage.set({
          error: false,
          message: 'Sedang membuat akun...'
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

        {/* confirm password */}
        <Form.Field name='confirmPassword' asChild>
          <label className='floating-label'>
            <Form.Label asChild>
              <span>Konfirmasi Password</span>
            </Form.Label>
            <Form.Control
              className='input input-lg'
              placeholder='Konfirmasi Password'
              type='password'
              required
            ></Form.Control>
          </label>
        </Form.Field>

        {/* role (hidden) */}
        <Form.Field name='role' asChild>
          <Form.Control
            type='hidden'
            value={
              createAdmin ? 'ADMINISTRATOR' : createViewer ? 'VIEWER' : 'USER'
            }
          ></Form.Control>
        </Form.Field>

        {/* the submit button */}
        <Form.Submit className='btn btn-primary mt-6' disabled={isPending}>
          Buat Akun
        </Form.Submit>
        <a className='btn btn-link' href='/user/login' role='button'>
          Sudah ada akun?
        </a>
      </Form.Root>
    </UserLoginSignupCard>
  )
}

export default SignupRC
