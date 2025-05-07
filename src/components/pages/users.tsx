import { type FC } from 'react'
import CardTemplate from '../common/card'
import LoadingCard from '../common/loading'
import TableTemplate from '../common/table'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import { $users, type User } from './stores/users'
import AddUserIcon from '~icons/lucide/user-plus'
import CopyIcon from '~icons/lucide/copy'
import WhatsappIcon from '~icons/simple-icons/whatsapp'

const UsersCardRC: FC<{ title: string }> = ({ title }) => {
  const data = useStore($users)

  const columnHelper = createColumnHelper<User>()
  const columns = [
    columnHelper.accessor('fullName', {
      header: () => 'Nama Pengguna',
      cell: (c) => (
        <div className='cursor-pointer' role='button'>
          {c.getValue()}
        </div>
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
              className='text-base-content/50 hover:text-primary cursor-pointer'
              role='button'
            >
              <CopyIcon className='text-sm' />
            </span>
            <span
              className='text-base-content/50 cursor-pointer hover:text-[#25D366]'
              role='button'
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
        <button className='btn btn-primary'>
          <AddUserIcon />
          <span>Tambah User</span>
        </button>
      </div>
    </CardTemplate>
  )
}

export default UsersCardRC
