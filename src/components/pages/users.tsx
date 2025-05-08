import {
  type FC,
  type PropsWithChildren,
  useRef,
  useActionState,
  Fragment
} from 'react'
import CardTemplate from '../common/card'
import LoadingCard from '../common/loading'
import TableTemplate from '../common/table'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel
} from '@tanstack/react-table'
import { Dialog, Form } from 'radix-ui'
import { useStore } from '@nanostores/react'
import {
  $users,
  $user,
  $openUserDialog,
  $createMode,
  $isOnlyAdmin,
  setUsers,
  setUser,
  setCreateMode,
  type User
} from './stores/users'
import { setToastOn } from '../toast/store'
import { actions, isInputError } from 'astro:actions'
import AddUserIcon from '~icons/lucide/user-plus'
import CopyIcon from '~icons/lucide/copy'
import WhatsappIcon from '~icons/simple-icons/whatsapp'
import SaveIcon from '~icons/lucide/save'

const UsersCardRC: FC<{ title: string }> = ({ title }) => {
  const data = useStore($users)

  const handleAddUser = () => {
    setCreateMode(true)
    setUser({
      userName: '',
      fullName: '',
      phoneNumber: '',
      role: 'VIEWER'
    })
  }

  const columnHelper = createColumnHelper<User>()
  const columns = [
    columnHelper.accessor('fullName', {
      header: () => 'Nama Pengguna',
      cell: (c) => (
        <UserEditDialog>
          <button
            className='btn btn-link'
            onClick={() => {
              setCreateMode(false)
              setUser(c.row.original)
            }}
          >
            <span>{c.getValue()}</span>
          </button>
        </UserEditDialog>
      )
    }),
    columnHelper.accessor('role', {
      header: () => 'Hak Akses',
      cell: (c) => (
        <span className='badge badge-outline badge-info badge-sm font-mono'>
          {c.getValue()}
        </span>
      )
    }),
    columnHelper.accessor('phoneNumber', {
      header: () => 'No. Telepon',
      cell: (c) =>
        c.getValue() ? (
          <div className='flex items-center gap-2'>
            <span>{c.getValue()}</span>
            <span
              className='text-base-content/50 hover:text-primary disabled:text-base-content/20 cursor-pointer'
              role='button'
              onClick={(e) => {
                const button = e.currentTarget
                button.setAttribute('disabled', 'true')
                navigator.clipboard.writeText(c.getValue() || '')
                setToastOn({ message: 'Nomor telepon sudah dicopy!' })
                setTimeout(() => button.removeAttribute('disabled'), 3000)
              }}
            >
              <CopyIcon className='text-sm' />
            </span>
            <span
              className='text-base-content/50 cursor-pointer hover:text-[#25D366]'
              role='button'
              onClick={() => {
                let phoneNumber = c.getValue()
                if (phoneNumber) {
                  if (phoneNumber.startsWith('0')) {
                    phoneNumber = '62' + phoneNumber.slice(1)
                  }
                  const whatsappUrl = `https://wa.me/${phoneNumber}`
                  window.open(whatsappUrl, '_blank')
                }
              }}
            >
              <WhatsappIcon className='text-sm' />
            </span>
          </div>
        ) : null
    })
  ]

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel()
  })

  if (!data) {
    return <LoadingCard />
  }

  return (
    <CardTemplate title={title}>
      <TableTemplate table={table} />

      <div className='mt-4 flex flex-row-reverse items-center'>
        <UserEditDialog>
          <button className='btn btn-primary' onClick={handleAddUser}>
            <AddUserIcon />
            <span>Tambah User</span>
          </button>
        </UserEditDialog>
      </div>
    </CardTemplate>
  )
}

export default UsersCardRC

const UserEditDialog: FC<PropsWithChildren> = ({ children }) => {
  const user = useStore($user)
  const open = useStore($openUserDialog)
  const handleOpen = () => {
    if (open) {
      setUser(undefined)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-[998] cursor-pointer bg-black/50' />
        <Dialog.Content className='fixed top-[50%] left-[50%] z-[999] w-[320px] translate-[-50%] lg:w-[40vw]'>
          <UserEditForm user={user} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const UserEditForm: FC<{ user: User | undefined }> = ({ user }) => {
  const createMode = useStore($createMode)
  const isOnlyAdmin = useStore($isOnlyAdmin)
  const ref = useRef<HTMLFormElement>(null)

  const title = createMode ? 'Tambah Pengguna' : 'Edit Pengguna'

  const [_state, submitAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      if (createMode) {
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
                  : error.fields.fullName
                    ? error.fields.fullName.join(', ')
                    : error.fields.phoneNumber
                      ? error.fields.phoneNumber.join(', ')
                      : 'Terjadi kesalahan yang tidak diketahui.'

          setToastOn({
            error: true,
            message
          })
        } else {
          setUser(undefined)
          setToastOn({
            message: 'Berhasil menambah data user.'
          })
        }
      } else {
        const { error } = await actions.user.set(formData)
        if (error) {
          const message = !isInputError(error)
            ? error.message
            : error.fields.fullName
              ? error.fields.fullName.join(', ')
              : error.fields.phoneNumber
                ? error.fields.phoneNumber.join(', ')
                : 'Terjadi kesalahan yang tidak diketahui.'

          setToastOn({
            error: true,
            message
          })
        } else {
          setUser(undefined)
          setToastOn({
            message: 'Berhasil memperbarui data user.'
          })
        }
      }

      await actions.user.getAll
        .orThrow()
        .then((updatedUsers) => setUsers(updatedUsers))

      return null
    },
    null
  )

  if (!user) {
    return <LoadingCard />
  }

  const handleDeleteUser = async () => {
    setUser(undefined)
    await actions.user.delete.orThrow({ userName: user.userName }).then(() => {
      setToastOn({
        message: 'Berhasil menghapus user.'
      })
    })
    await actions.user.getAll
      .orThrow()
      .then((updatedUsers) => setUsers(updatedUsers))
  }

  return (
    <CardTemplate title={title}>
      <Form.Root
        action={submitAction}
        className='flex flex-1 flex-col gap-4'
        ref={ref}
      >
        {/* name */}
        <Form.Field name='fullName' className='flex flex-col gap-2'>
          <Form.Label className='font-bold'>Nama</Form.Label>
          <Form.Control
            className='input input-lg w-full'
            defaultValue={user.fullName || ''}
          />
        </Form.Field>

        {/* username */}
        <Form.Field name='userName' className='flex flex-col gap-2'>
          <Form.Label className='font-bold'>Username</Form.Label>
          <Form.Control
            className='input input-lg w-full'
            defaultValue={user.userName}
            readOnly={!createMode}
          />
        </Form.Field>

        {/* role */}
        <Form.Field name='role' className='flex flex-col gap-2'>
          <Form.Label className='font-bold'>Hak Akses</Form.Label>
          <Form.Control asChild>
            <select
              className='select select-lg w-full'
              defaultValue={user.role}
              disabled={!createMode && isOnlyAdmin}
            >
              <option value='VIEWER'>Viewer</option>
              <option value='USER'>User</option>
              <option value='ADMINISTRATOR'>Administrator</option>
            </select>
          </Form.Control>
        </Form.Field>

        {/* phone */}
        <Form.Field name='phoneNumber' className='flex flex-col gap-2'>
          <Form.Label className='font-bold'>Nomor Telepon</Form.Label>
          <Form.Control
            className='input input-lg w-full'
            defaultValue={user.phoneNumber || ''}
            disabled={!user}
          />
        </Form.Field>

        {/* only render on create mode */}
        <Fragment>
          {createMode && (
            <Fragment>
              {/* password */}
              <Form.Field name='password' className='flex flex-col gap-2'>
                <Form.Label className='font-bold'>Buat Password</Form.Label>
                <Form.Control
                  className='input input-lg w-full'
                  type='password'
                  disabled={!user || !createMode}
                />
              </Form.Field>

              {/* confirm password */}
              <Form.Field
                name='confirmPassword'
                className='flex flex-col gap-2'
              >
                <Form.Label className='font-bold'>
                  Konfirmasi Password
                </Form.Label>
                <Form.Control
                  className='input input-lg w-full'
                  type='password'
                  disabled={!user || !createMode}
                />
              </Form.Field>
            </Fragment>
          )}
        </Fragment>

        {/* actions group */}
        <div className='mt-4 flex flex-row-reverse items-center gap-4'>
          {/* the save button */}
          <Form.Submit className='btn btn-primary w-max' disabled={isPending}>
            {isPending ? (
              <span className='loading loading-dots loading-xs'></span>
            ) : (
              <SaveIcon />
            )}
            <span>Simpan</span>
          </Form.Submit>

          {/* the cancel button */}
          <button
            className='btn btn-neutral'
            onClick={() => setUser(undefined)}
            disabled={isPending}
          >
            <span>Cancel</span>
          </button>

          {/* the delete button */}
          {!createMode && (
            <button
              className='btn btn-error mr-auto'
              onClick={handleDeleteUser}
              disabled={
                isPending || (isOnlyAdmin && user.role === 'ADMINISTRATOR')
              }
            >
              <span>Hapus User</span>
            </button>
          )}
        </div>
      </Form.Root>
    </CardTemplate>
  )
}
