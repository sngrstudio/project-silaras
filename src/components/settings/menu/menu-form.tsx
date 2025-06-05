import { useActionState, useRef, useState, type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import {
  type DailyAssesmentsSettings,
  setDailyAssesmentsSettings,
  $currentMonthIndex
} from './menu.store'
import { actions, isInputError } from 'astro:actions'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'
import UtensilsIcon from '~icons/lucide/utensils'
import EditIcon from '~icons/lucide/edit'

interface MenuFormProps {
  cell: CellContext<DailyAssesmentsSettings[number], unknown>
}

const MenuForm: FC<MenuFormProps> = ({ cell }) => {
  const currentMonthIndex = useStore($currentMonthIndex)
  const formRef = useRef<HTMLFormElement>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleForm = async (_prev: unknown, data: FormData) => {
    const { error } = await actions.assesment.settings.setDaily(data)
    if (error) {
      if (isInputError(error)) {
        return error
      }

      showErrorToast('Terjadi kesalahan saat menyimpan pengaturan menu.')
      return undefined
    }

    const updatedState = await actions.assesment.settings.getAllDaily.orThrow({
      monthIndex: currentMonthIndex
    })
    setDailyAssesmentsSettings(updatedState)
    showSuccessToast('Pengaturan menu berhasil disimpan!')
    return undefined
  }

  const [_error, action, isPending] = useActionState(handleForm, undefined)

  const handleSave = () => {
    if (!formRef.current || isPending) return
    // Only submit if something changed
    const form = formRef.current
    const menu1 = form.menu1.value
    const menu2 = form.menu2.value
    if (
      menu1 === cell.row.original.menu1 &&
      menu2 === cell.row.original.menu2
    ) {
      setIsEditing(false)
      return
    }
    form.requestSubmit()
  }

  const handleFocus = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    handleSave()
  }

  return (
    <form className='space-y-4' action={action} ref={formRef}>
      {/* Menu 1 */}
      <div className='space-y-2'>
        <label className='text-base-content flex items-center gap-2 text-sm font-medium'>
          <UtensilsIcon className='text-primary h-4 w-4' />
          Menu 1
        </label>
        <div className='relative'>
          <input
            name='menu1'
            className={`input input-bordered w-full transition-all duration-200 ${
              isEditing
                ? 'border-primary focus:border-primary focus:ring-primary/20 focus:ring-2'
                : 'hover:border-primary/50'
            } ${isPending ? 'loading' : ''}`}
            type='text'
            defaultValue={cell.row.original.menu1}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isPending}
            placeholder='Masukkan menu 1'
          />
          {isEditing && (
            <EditIcon className='text-primary/60 absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2' />
          )}
        </div>
      </div>

      {/* Menu 2 */}
      <div className='space-y-2'>
        <label className='text-base-content flex items-center gap-2 text-sm font-medium'>
          <UtensilsIcon className='text-accent h-4 w-4' />
          Menu 2
        </label>
        <div className='relative'>
          <input
            name='menu2'
            className={`input input-bordered w-full transition-all duration-200 ${
              isEditing
                ? 'border-accent focus:border-accent focus:ring-accent/20 focus:ring-2'
                : 'hover:border-accent/50'
            } ${isPending ? 'loading' : ''}`}
            type='text'
            defaultValue={cell.row.original.menu2}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isPending}
            placeholder='Masukkan menu 2'
          />
          {isEditing && (
            <EditIcon className='text-accent/60 absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2' />
          )}
        </div>
      </div>

      {/* hidden fields */}
      <input
        type='hidden'
        name='monthlyAssesmentId'
        value={cell.row.original.monthlyAssesmentId}
      />
      <input
        type='hidden'
        name='date'
        value={cell.row.original.date.toISOString()}
      />
    </form>
  )
}

export default MenuForm
