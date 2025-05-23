import { type FC } from 'react'
import TableTemplate from '~/components/common/table/desktop'
import ListTemplate from '~/components/common/table/mobile'
import MobileList from './mobile-list'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import { $patients, type Patients } from './patient.store'

const columnHelper = createColumnHelper<Patients[number]>()
const dColumns = [
  columnHelper.accessor('name', {
    header: 'Nama',
    cell: (cell) => cell.getValue()
  })
]
const mColumns = [
  columnHelper.display({
    id: 'mobile',
    cell: (cell) => <MobileList cell={cell} />
  })
]

const PatientRC: FC = () => {
  const patients = useStore($patients)
  if (!patients) return <></>
  return <PatientTableRenderer data={patients} />
}

export default PatientRC

const PatientTableRenderer: FC<{ data: Patients }> = ({ data }) => {
  const dTable = useReactTable({
    columns: dColumns,
    data,
    getCoreRowModel: getCoreRowModel()
  })
  const mTable = useReactTable({
    columns: mColumns,
    data,
    getCoreRowModel: getCoreRowModel()
  })
  return (
    <>
      <ListTemplate table={mTable} className='-mx-6 md:hidden' />
      <TableTemplate table={dTable} className='max-md:hidden' />
    </>
  )
}
