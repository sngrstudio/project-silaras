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
  $patients,
  setCurrentPatient,
  setCurrentRegion,
  type Patients
} from './patient.store'
import { actions } from 'astro:actions'

type Patient = Patients[number]

const columnHelper = createColumnHelper<Patient>()
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
      <div className='card-actions'>
        <PatientAddButton />
      </div>
      <ListTemplate table={mTable} className='-mx-6 md:hidden' />
      <TableTemplate table={dTable} className='max-md:hidden' />
    </>
  )
}

export const PatientAddButton: FC = () => {
  const handleClick = async () => {
    const regionSlug = window.location.pathname.split('/').at(-1) ?? ''
    const region = await actions.region.getBySlug.orThrow({ slug: regionSlug })
    setCurrentRegion(region!)

    setCurrentPatient({
      name: '',
      motherName: '',
      birthDate: new Date(Date.now()),
      initialHeight: 0,
      initialWeight: 0,
      status: 'ANAK-ANAK',
      latitude: 0,
      longitude: 0,
      regionId: region?.id!
    })
  }

  return (
    <button className='btn btn-primary max-md:w-full' onClick={handleClick}>
      <span>Tambah Pasien</span>
    </button>
  )
}
