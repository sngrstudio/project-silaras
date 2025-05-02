import { type FC, useActionState } from 'react'
import { Form } from 'radix-ui'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

const roles = ['SYSTEM', 'ADMINISTRATOR', 'USER', 'VIEWER'] as const

const CreateUserFormRC: FC = () => {
  const formAction = async (_: {}, formData: FormData) => {
    const { error } = await actions.auth.signup(formData)
    if (!error) {
      navigate('/')
    }

    return { error }
  }

  const [state, submitAction, isPending] = useActionState(formAction, {
    error: undefined
  })

  return (
    <Form.Root action={submitAction}>
      {/* Username */}
      <Form.Field name='userName'>
        <Form.Label>Masukkan Username</Form.Label>
        <Form.Control placeholder='usernamekeren'></Form.Control>
      </Form.Field>

      {/* Password */}
      <Form.Field name='password'>
        <Form.Label>Masukkan Password</Form.Label>
        <Form.Control
          placeholder='Minimal 8 Karakter'
          type='password'
        ></Form.Control>
      </Form.Field>

      {/* Confirm Password */}
      <Form.Field name='confirmPassword'>
        <Form.Label>Konfirmasi Password</Form.Label>
        <Form.Control
          placeholder='Masukkan Lagi'
          type='password'
        ></Form.Control>
      </Form.Field>

      {/* Choose a Role */}
      <Form.Field name='role'>
        <Form.Label>Pilih Role</Form.Label>
        <Form.Control asChild>
          <select>
            {roles.map((role) => (
              <option value={role} key={role}>
                {role}
              </option>
            ))}
          </select>
        </Form.Control>
      </Form.Field>

      <Form.Submit disabled={isPending}>Buat Akun</Form.Submit>
    </Form.Root>
  )
}

export default CreateUserFormRC
