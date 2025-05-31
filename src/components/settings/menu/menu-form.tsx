import { useActionState, useRef, type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import {
  type DailyAssesmentsSettings,
  setDailyAssesmentsSettings,
  $currentMonthIndex
} from './menu.store'
import { actions, isInputError } from 'astro:actions'

interface MenuFormProps {
  cell: CellContext<DailyAssesmentsSettings[number], unknown>
}

const MenuForm: FC<MenuFormProps> = ({ cell }) => {
  const currentMonthIndex = useStore($currentMonthIndex)
  const formRef = useRef<HTMLFormElement>(null)

  const handleForm = async (_prev: unknown, data: FormData) => {
    const { error } = await actions.assesment.settings.setDaily(data)
    if (error) {
      if (isInputError(error)) {
        return error
      }

      console.log(error)
      return undefined
    }

    const updatedState = await actions.assesment.settings.getAllDaily.orThrow({
      monthIndex: currentMonthIndex
    })
    setDailyAssesmentsSettings(updatedState)
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
      return
    }
    form.requestSubmit()
  }

  return (
    <form className='max-md:mt-2' action={action} ref={formRef}>
      <input
        name='menu1'
        className='input input-ghost w-full'
        type='text'
        defaultValue={cell.row.original.menu1}
        onBlur={handleSave}
        disabled={isPending}
      />
      <input
        name='menu2'
        className='input input-ghost w-full'
        type='text'
        defaultValue={cell.row.original.menu2}
        onBlur={handleSave}
        disabled={isPending}
      />

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
