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

const UsersCardRC: FC<{ title: string }> = ({ title }) => {
  const data = useStore($users)

  const columnHelper = createColumnHelper<User>()
  const columns = [
    columnHelper.accessor('fullName', {
      header: () => 'Nama Pengguna',
      cell: (c) => c.getValue()
    }),
    columnHelper.accessor('role', {
      header: () => 'Hak Akses',
      cell: (c) => c.getValue()
    }),
    columnHelper.accessor('phoneNumber', {
      header: () => 'No. Telepon',
      cell: (c) => c.getValue()
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
    </CardTemplate>
  )
}

export default UsersCardRC
