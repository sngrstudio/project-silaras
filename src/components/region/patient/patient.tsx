import { type FC, useState, useMemo } from 'react'
import TableTemplate from '~/components/common/table/desktop'
import ListTemplate from '~/components/common/table/mobile'
import MobileList from './mobile-list'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState
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
import WhatsAppIcon from '~icons/simple-icons/whatsapp'
import GMapsIcon from '~icons/simple-icons/googlemaps'
import { canUserAccessPatientSync } from '../../../utils/access-control'
import { useUserRegion } from '../../../utils/hooks/useUserRegion'

type Patient = Patients[number]

// Helper function to copy text to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here if available
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const columnHelper = createColumnHelper<Patient>()

// Function to create dynamic columns with access control
const createDesktopColumns = (
  currentUser: any,
  userRegion: any,
  currentRegion: any,
  loading: boolean
) => [
  columnHelper.accessor('name', {
    header: 'Nama',
    enableSorting: true,
    cell: (cell) => {
      const url = `/patient/${cell.row.original.slug}`

      // Check if user can access this patient
      const canAccess =
        !loading &&
        currentRegion &&
        userRegion &&
        canUserAccessPatientSync(currentUser, currentRegion, userRegion)

      if (canAccess) {
        return (
          <a className='link font-bold' href={url}>
            {cell.getValue()}
          </a>
        )
      } else {
        return (
          <span
            className='text-base-content/50 cursor-not-allowed font-bold'
            title='Anda tidak memiliki akses ke pasien ini'
          >
            {cell.getValue()}
          </span>
        )
      }
    }
  }),
  columnHelper.accessor('age', {
    header: 'Umur',
    enableSorting: true,
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
    enableSorting: true,
    cell: (cell) => {
      return (
        <span className='badge badge-soft badge-primary badge-sm'>
          {cell.getValue()}
        </span>
      )
    }
  }),
  columnHelper.accessor('phoneNumber', {
    header: 'No. Telepon',
    enableSorting: false,
    cell: (cell) => {
      const phone = cell.getValue()
      if (!phone) return <span className='text-gray-400'>-</span>

      const handleCopyPhone = () => {
        copyToClipboard(phone)
      }

      return (
        <div className='flex items-center gap-2'>
          <button
            onClick={handleCopyPhone}
            className='hover:text-primary cursor-pointer'
            title='Klik untuk menyalin nomor telepon'
          >
            {phone}
          </button>
          <a
            className='btn btn-ghost btn-xs'
            href={`https://wa.me/${phone.replace(/^08/, '628')}`}
            target='_blank'
            aria-label='WhatsApp'
          >
            <WhatsAppIcon />
          </a>
        </div>
      )
    }
  }),
  columnHelper.display({
    id: 'd-actions',
    header: 'Aksi',
    enableSorting: false,
    cell: (cell) => {
      const canAccess =
        !loading &&
        currentRegion &&
        userRegion &&
        canUserAccessPatientSync(currentUser, currentRegion, userRegion)

      const handleEditBtn = () => {
        setCurrentPatient(cell.row.original)
      }

      return (
        <div className='flex gap-2'>
          <button
            className={`btn btn-soft btn-primary btn-xs ${!canAccess ? 'btn-disabled' : ''}`}
            onClick={handleEditBtn}
            disabled={!canAccess}
            title={
              !canAccess
                ? 'Anda tidak memiliki akses ke pasien ini'
                : 'Edit pasien'
            }
          >
            <EditIcon />
            <span>Edit</span>
          </button>

          <a
            className='btn btn-soft btn-neutral btn-xs'
            href={`https://www.google.com/maps/search/?api=1&query=${cell.row.original.latitude},${cell.row.original.longitude}`}
            target='_blank'
          >
            <GMapsIcon />
            <span>Lokasi</span>
          </a>
        </div>
      )
    }
  })
]

// Function to create mobile columns with access control
const createMobileColumns = (
  currentUser: any,
  userRegion: any,
  loading: boolean
) => [
  columnHelper.display({
    id: 'mobile',
    cell: (cell) => (
      <MobileList
        cell={cell}
        currentUser={currentUser}
        userRegion={userRegion}
        loading={loading}
      />
    )
  })
]

const PatientRC: FC = () => {
  const patients = useStore($patients)
  const currentRegion = useStore($currentRegion)
  const [searchInput, setSearchInput] = useState('')
  const { userRegion, loading, currentUser } = useUserRegion()

  // Filter patients based on search input
  const filteredData = useMemo(() => {
    if (!patients || !searchInput.trim()) {
      return patients || []
    }

    const search = searchInput.toLowerCase()
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(search) ||
        patient.status.toLowerCase().includes(search) ||
        patient.phoneNumber?.toLowerCase().includes(search) ||
        patient.motherName?.toLowerCase().includes(search)
    )
  }, [patients, searchInput])

  if (!patients) return <></>

  return (
    <>
      {/* Search and Add Button in same line */}
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <input
          type='text'
          placeholder='Cari pasien berdasarkan nama, status, atau nomor telepon...'
          className='input input-bordered w-full sm:max-w-md'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <PatientAddButton />
      </div>

      <PatientTableRenderer
        data={filteredData}
        currentUser={currentUser}
        userRegion={userRegion}
        currentRegion={currentRegion}
        loading={loading}
      />
    </>
  )
}

export default PatientRC

const PatientTableRenderer: FC<{
  data: Patients
  currentUser: any
  userRegion: any
  currentRegion: any
  loading: boolean
}> = ({ data, currentUser, userRegion, currentRegion, loading }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false } // Default sort by name alphabetically
  ])

  // Create dynamic columns with access control
  const dColumns = useMemo(
    () => createDesktopColumns(currentUser, userRegion, currentRegion, loading),
    [currentUser, userRegion, currentRegion, loading]
  )

  const mColumns = useMemo(
    () => createMobileColumns(currentUser, userRegion, loading),
    [currentUser, userRegion, loading]
  )

  // Sort data manually for mobile table
  const sortedData = useMemo(() => {
    if (sorting.length === 0) return data

    return [...data].sort((a, b) => {
      for (const sort of sorting) {
        let aValue: string | number = ''
        let bValue: string | number = ''

        if (sort.id === 'name') {
          aValue = a.name
          bValue = b.name
        } else if (sort.id === 'age') {
          aValue = a.age || 0
          bValue = b.age || 0
        } else if (sort.id === 'status') {
          // Custom sort order for patient status
          const statusOrder = { 'ANAK-ANAK': 1, HAMIL: 2, MENYUSUI: 3 }
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 4
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 4
        }

        if (aValue < bValue) return sort.desc ? 1 : -1
        if (aValue > bValue) return sort.desc ? -1 : 1
      }
      return 0
    })
  }, [data, sorting])

  const dTable = useReactTable({
    columns: dColumns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting
  })

  const mTable = useReactTable({
    columns: mColumns,
    data: sortedData, // Use pre-sorted data for mobile
    getCoreRowModel: getCoreRowModel()
  })

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className='py-8 text-center'>
        <div className='text-base-content/70 text-lg'>
          Belum ada data pasien
        </div>
        <div className='text-base-content/50 mt-1 text-sm'>
          Silakan tambah pasien baru untuk memulai
        </div>
      </div>
    )
  }

  return (
    <>
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
    <button
      className='btn btn-primary w-full whitespace-nowrap sm:w-auto'
      onClick={handleClick}
    >
      <AddPatientIcon />
      <span>Tambah Pasien</span>
    </button>
  )
}
