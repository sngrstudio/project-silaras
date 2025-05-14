import {
  type FC,
  type PropsWithChildren,
  type MouseEventHandler,
  useActionState,
  useState,
  useRef
} from 'react'
import CardTemplate from '../../common/card/card'
import LoadingCard from '../../common/card/loading'
import TableTemplate from '~/components/common/table/table'
import { FormLabel } from '../../common/form/form'
import Image from '../../common/image/image'
import { Dialog } from 'radix-ui'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import {
  $allUser,
  setAllUser,
  $user,
  setUser,
  $openDialog,
  $createMode,
  setCreateMode,
  type User
} from './store'
import { $accessLevels } from '../profile/store'
import { $showToast, setToastMessage } from '~/components/layout/toast/store'
import { actions, isInputError } from 'astro:actions'
import CopyIcon from '~icons/lucide/copy'
import WhatsappIcon from '~icons/simple-icons/whatsapp'
import SaveIcon from '~icons/lucide/save'

const UsersRC: FC = () => {
  return (
    <CardTemplate title='Daftar Pengguna'>
      <UsersTable />
    </CardTemplate>
  )
}

export default UsersRC

const UsersTable: FC = () => {
  const data = useStore($allUser)

  if (!data) {
    return <LoadingCard />
  }

  const columnHelper = createColumnHelper<User>()
  const columns = [
    columnHelper.accessor('fullName', {
      header: 'Nama',
      cell: (cell) => <TableFullNameCell cell={cell} />
    }),
    columnHelper.accessor('accessLevel', {
      header: 'Hak Akses',
      cell: (cell) => {
        return <TableAccessLevelCell cell={cell} />
      }
    }),
    columnHelper.accessor('phoneNumber', {
      header: 'No. Telepon',
      cell: (cell) => <TablePhoneNumCell cell={cell} />
    })
  ]

  return <UsersTableRenderer columns={columns} data={data} />
}

const UsersTableRenderer: FC<{
  columns: Array<ColumnDef<User, any>>
  data: Array<User>
}> = ({ columns, data }) => {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      <TableTemplate table={table} className='table-fixed max-lg:hidden' />
      <div className='mt-6 flex flex-row-reverse'>
        <UserDialogBox>
          <UserDialog />
        </UserDialogBox>
      </div>
    </>
  )
}

const UserDialog: FC = () => {
  const ref = useRef<HTMLFormElement>(null)
  const [formChanged, setFormChanged] = useState(false)

  const updateUser = async (_: unknown, formData: FormData) => {
    const { data, error } = await actions.user.create(formData)
    if (error && !data) {
      if (isInputError(error)) {
        return error
      }

      setToastMessage({
        error: true,
        message: error.message
      })
      return undefined
    }

    setToastMessage({
      message: 'Menyimpan perubahan...'
    })
    if (!showToast) {
      const updatedUsersData = await actions.user.getAll.orThrow()
      setAllUser(updatedUsersData)
      setCreateMode(undefined)
      setUser(undefined)
      setFormChanged(false)
    }
    return undefined
  }

  const [error, submitAction, isPending] = useActionState(updateUser, undefined)

  const handleFormChange = () => {
    setFormChanged(true)
  }

  const handleReset: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    ref.current?.reset()
    setFormChanged(false)
  }

  const user = useStore($user)
  const accessLevels = useStore($accessLevels)
  const showToast = useStore($showToast)
  const createMode = useStore($createMode)

  if (!user) {
    return <></>
  }

  const handleDelete: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault()
    await actions.user.delete({ userName: user.userName }).then(async () => {
      const updatedUsersData = await actions.user.getAll.orThrow()
      setAllUser(updatedUsersData)
      setCreateMode(undefined)
      setUser(undefined)
      setFormChanged(false)
    })
  }

  return (
    <form action={submitAction} className='flex flex-col gap-4' ref={ref}>
      <FormLabel label='Nama'>
        <input
          name='fullName'
          className='input input-lg w-full'
          type='text'
          defaultValue={user.fullName}
          disabled={isPending || showToast}
          onChange={handleFormChange}
        />
        {error && error.fields.fullName && (
          <span className='text-error'>
            {error.fields.fullName.join(' | ')}
          </span>
        )}
      </FormLabel>

      <FormLabel label='Username'>
        <input
          name='userName'
          className='input input-lg w-full'
          type='text'
          defaultValue={user.userName}
          disabled={isPending || showToast || !createMode}
        />
        <span className='italic'>
          Username bersifat permanen dan tidak dapat diganti.
        </span>
      </FormLabel>

      {createMode && (
        <>
          <FormLabel label='Password'>
            <input
              name='password'
              className='input input-lg w-full'
              type='password'
              disabled={isPending || showToast || !createMode}
            />
          </FormLabel>

          <FormLabel label='Konfirmasi Password'>
            <input
              name='confirmPassword'
              className='input input-lg w-full'
              type='password'
              disabled={isPending || showToast || !createMode}
            />
          </FormLabel>
        </>
      )}

      <FormLabel label='Hak Akses'>
        <select
          name='accessLevel'
          className='select select-lg w-full'
          disabled={isPending || showToast || !accessLevels}
        >
          {accessLevels ? (
            accessLevels.map((lv) => (
              <option value={lv.id} selected={lv.id === user.accessLevel}>
                {lv.description}
              </option>
            ))
          ) : (
            <option selected disabled>
              Mohon tunggu...
            </option>
          )}
        </select>
        <span className='italic'>
          Hak akses hanya dapat diganti oleh Administrator.
        </span>
      </FormLabel>

      <FormLabel label='Nomor Telepon'>
        <input
          name='phoneNumber'
          className='input input-lg w-full'
          type='text'
          defaultValue={user.phoneNumber || ''}
          disabled={isPending || showToast}
          onChange={handleFormChange}
        />
        {error && error.fields.phoneNumber && (
          <span className='text-error'>
            {error.fields.phoneNumber.join(' | ')}
          </span>
        )}
      </FormLabel>

      <FormLabel label='Foto Profil'>
        <div className='flex w-full items-center gap-2'>
          {user.profilePhoto && (
            <Image
              className='h-[120px] w-[120px]'
              src={user.profilePhoto}
              width={120}
              height={120}
            />
          )}
          <input
            name='profilePhoto'
            className='file-input file-input-lg flex-1'
            type='file'
            accept='image/*'
            disabled={isPending || showToast}
            onChange={handleFormChange}
          />
        </div>
        {error && error.fields.profilePhoto && (
          <span className='text-error'>
            {error.fields.profilePhoto.join(' | ')}
          </span>
        )}
      </FormLabel>

      {!createMode && (
        <input name='userName' type='hidden' value={user.userName} />
      )}

      <div className='mt-6 flex flex-row-reverse gap-4'>
        <button
          className='btn btn-primary flex items-center gap-2'
          type='submit'
          disabled={isPending || showToast || !formChanged}
        >
          <SaveIcon />
          <span>Simpan</span>
        </button>

        <button
          className='btn flex items-center gap-2'
          disabled={isPending || showToast || !formChanged}
          onClick={handleReset}
        >
          <span>Reset</span>
        </button>

        {createMode ? (
          <button
            className='btn mr-auto flex items-center gap-2'
            disabled={isPending || showToast}
            onClick={() => {
              setCreateMode(undefined)
              setUser(undefined)
            }}
          >
            <span>Tutup</span>
          </button>
        ) : (
          <button
            className='btn btn-error mr-auto flex items-center gap-2'
            disabled={isPending || showToast}
            onClick={handleDelete}
          >
            <span>Hapus</span>
          </button>
        )}
      </div>
    </form>
  )
}

const UserDialogBox: FC<PropsWithChildren> = ({ children }) => {
  const openDialog = useStore($openDialog)

  const handleDialog = () => {
    if (!openDialog) {
      setCreateMode(true)
      setUser({
        userId: '',
        fullName: '',
        userName: '',
        accessLevel: 1,
        phoneNumber: null,
        profilePhoto: null
      })
    } else {
      setCreateMode(undefined)
      setUser(undefined)
    }
  }

  return (
    <Dialog.Root open={openDialog} onOpenChange={handleDialog}>
      <Dialog.Trigger asChild>
        <button className='btn btn-primary'>
          <span>Tambah Pengguna</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='bg-neutral/20 fixed inset-0 z-[998] cursor-pointer'></Dialog.Overlay>
        <Dialog.Content className='bg-base-100 card lg:card-lg fixed top-[50%] left-[50%] z-[999] translate-[-50%] shadow lg:w-[50vw]'>
          <div className='card-body'>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const TableFullNameCell: FC<{ cell: CellContext<User, string> }> = ({
  cell
}) => {
  const handleSetUser = () => {
    setUser(cell.row.original)
  }
  return (
    <div
      className='btn btn-link pl-0 text-left'
      role='button'
      onClick={handleSetUser}
    >
      {cell.getValue()}
    </div>
  )
}

const TableAccessLevelCell: FC<{ cell: CellContext<User, number> }> = ({
  cell
}) => {
  const accessLevels = useStore($accessLevels)
  if (!accessLevels) {
    return null
  }

  return (
    <span className='badge badge-outline badge-info badge-sm rounded-full font-mono uppercase'>
      {accessLevels.find((l) => l.id === cell.getValue())?.description}
    </span>
  )
}

const TablePhoneNumCell: FC<{ cell: CellContext<User, string | null> }> = ({
  cell
}) => {
  return (
    <div className='flex items-center gap-1'>
      <span>{cell.getValue()}</span>
      <span className='btn btn-ghost btn-xs' role='button'>
        <CopyIcon />
      </span>
      <span className='btn btn-ghost btn-xs' role='button'>
        <WhatsappIcon />
      </span>
    </div>
  )
}
