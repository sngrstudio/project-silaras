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
import {
  $currentRegion,
  $patients,
  setCurrentPatient,
  type Patients
} from './patient.store'
import AddPatientIcon from '~icons/lucide/user-plus'
import EditIcon from '~icons/lucide/pen'
import DeleteIcon from '~icons/lucide/trash-2'

type Patient = Patients[number]

const columnHelper = createColumnHelper<Patient>()
const dColumns = [
  columnHelper.accessor('name', {
    header: 'Nama',
    cell: (cell) => {
      const url = `/patient/${cell.row.original.slug}`
      return (
        <a className='link font-bold' href={url}>
          {cell.getValue()}
        </a>
      )
    }
  }),
  columnHelper.accessor('age', {
    header: 'Umur',
    cell: (cell) => {
      const age = cell.getValue()
      if (!age) {
        return <></>
      }

      return (
        <span>
          {age <= 24
            ? `${age} bulan`
            : `${Math.floor(age / 12)} tahun ${age % 12} bulan`}
        </span>
      )
    }
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (cell) => {
      return (
        <span className='badge badge-soft badge-primary badge-sm'>
          {cell.getValue()}
        </span>
      )
    }
  }),
  columnHelper.display({
    id: 'd-actions',
    header: 'Aksi',
    cell: (cell) => {
      const handleEditBtn = () => {
        setCurrentPatient(cell.row.original)
      }

      return (
        <div className='flex gap-2'>
          <button
            className='btn btn-soft btn-primary btn-xs'
            onClick={handleEditBtn}
          >
            <EditIcon />
            <span>Edit</span>
          </button>

          <button
            className='btn btn-soft btn-error btn-xs'
            onClick={handleEditBtn}
          >
            <DeleteIcon />
            <span>Hapus</span>
          </button>
        </div>
      )
    }
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
      <div className='card-actions flex-row-reverse'>
        <PatientAddButton />
      </div>
      <ListTemplate table={mTable} className='-mx-6 md:hidden' />
      <TableTemplate table={dTable} className='max-md:hidden' />
    </>
  )
}

export const PatientAddButton: FC = () => {
  const currentRegion = useStore($currentRegion)

  const handleClick = async () => {
    setCurrentPatient({
      name: '',
      motherName: '',
      birthDate: new Date(Date.now()),
      initialHeight: 0,
      initialWeight: 0,
      status: 'ANAK-ANAK',
      latitude: 0,
      longitude: 0,
      regionId: currentRegion?.id!,
      id: '',
      address: '',
      phoneNumber: ''
    })
  }

  return (
    <button className='btn btn-primary max-md:w-full' onClick={handleClick}>
      <AddPatientIcon />
      <span>Tambah Pasien</span>
    </button>
  )
}
