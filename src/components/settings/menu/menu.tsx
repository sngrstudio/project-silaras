import { type FC } from 'react'
import TableTemplate from '~/components/common/table/desktop'
import ListTemplate from '~/components/common/table/mobile'
import MobileList from './mobile-list'
import Navigation from './navigation'
import MenuForm from './menu-form'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import {
  $dailyAssesmentsSettings,
  type DailyAssesmentsSettings
} from './menu.store'
import CalendarIcon from '~icons/lucide/calendar'
import UtensilsIcon from '~icons/lucide/utensils'

const columnHelper = createColumnHelper<DailyAssesmentsSettings[number]>()
const dColumns = [
  columnHelper.accessor('date', {
    header: () => (
      <div className='flex items-center gap-2'>
        <CalendarIcon className='h-4 w-4' />
        <span>Tanggal</span>
      </div>
    ),
    cell: (cell) => {
      const date = cell
        .getValue()
        ?.toLocaleDateString('id-ID', { dateStyle: 'full' })

      return (
        <div className='flex items-center gap-2'>
          <CalendarIcon className='text-primary h-4 w-4' />
          <span className='font-medium'>{date}</span>
        </div>
      )
    }
  }),
  columnHelper.display({
    id: 'd-form',
    header: () => (
      <div className='flex items-center gap-2'>
        <UtensilsIcon className='h-4 w-4' />
        <span>Menu Harian</span>
      </div>
    ),
    cell: (cell) => <MenuForm cell={cell} key={cell.row.original.id} />
  })
]
const mColumns = [
  columnHelper.display({
    id: 'mobile',
    cell: (cell) => <MobileList cell={cell} />
  })
]

const MenuRC: FC = () => {
  const dailyAssesments = useStore($dailyAssesmentsSettings)

  if (!dailyAssesments) {
    return (
      <div className='flex items-center justify-center p-8'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6 p-6 md:p-8'>
      <div className='mb-2'>
        <h1 className='text-base-content text-2xl font-bold md:text-3xl'>
          Setelan Menu
        </h1>
        <p className='text-base-content/70 mt-1 text-sm'>
          Kelola menu harian untuk penilaian asupan gizi
        </p>
      </div>

      {/* Month Navigation Section */}
      <fieldset className='border-info/20 from-info/5 to-info/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
        <legend className='border-info/30 bg-base-100 text-info flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
          <CalendarIcon className='h-5 w-5' />
          Navigasi Bulan
        </legend>

        <div className='flex justify-center'>
          <Navigation />
        </div>
      </fieldset>

      {/* Menu Settings Section */}
      <fieldset className='border-primary/20 from-primary/5 to-primary/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
        <legend className='border-primary/30 bg-base-100 text-primary flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
          <UtensilsIcon className='h-5 w-5' />
          Menu Harian
        </legend>

        <div className='text-base-content/70 mb-4 text-sm'>
          Klik pada kolom menu untuk mengedit. Perubahan akan disimpan secara
          otomatis.
        </div>

        <MenuTableRenderer data={dailyAssesments} />
      </fieldset>
    </div>
  )
}

export default MenuRC

const MenuTableRenderer: FC<{ data: DailyAssesmentsSettings }> = ({ data }) => {
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
