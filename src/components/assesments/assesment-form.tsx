import { useActionState, useRef, type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import {
  type DailyAssesments,
  setDailyAssesments,
  $currentMonthIndex
} from './assesment.store'
import { actions, isInputError } from 'astro:actions'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'

interface AssesmentFormProps {
  cell: CellContext<DailyAssesments[number], unknown>
}

const AssesmentForm: FC<AssesmentFormProps> = ({ cell }) => {
  const currentMonthIndex = useStore($currentMonthIndex)
  const formRef = useRef<HTMLFormElement>(null)

  const handleForm = async (_prev: unknown, data: FormData) => {
    const { error } = await actions.assesment.daily.set(data)
    if (error) {
      if (isInputError(error)) {
        return error
      }

      showErrorToast('Terjadi kesalahan saat menyimpan data asesmen.')
      return undefined
    }

    const updatedState = await actions.assesment.daily.getAll.orThrow({
      patientSlug: window.location.pathname.split('/').at(-1) || '',
      monthIndex: currentMonthIndex
    })
    setDailyAssesments(updatedState)
    showSuccessToast('Data asesmen berhasil disimpan!')
    return undefined
  }

  const [_error, action, isPending] = useActionState(handleForm, undefined)

  const handleSave = () => {
    if (!formRef.current || isPending) return
    const form = formRef.current
    // Only submit if something changed
    const changed =
      form.containsStapleFood.checked !==
        !!cell.row.original.containsStapleFood ||
      form.containsSideDish.checked !== !!cell.row.original.containsSideDish ||
      form.containsVegetables.checked !==
        !!cell.row.original.containsVegetables ||
      form.containsFruits.checked !== !!cell.row.original.containsFruits ||
      form.isFollowingRecipe.checked !== !!cell.row.original.isFollowingRecipe
    if (!changed) return
    form.requestSubmit()
  }

  return (
    <form
      ref={formRef}
      className='flex w-full flex-col gap-y-1 md:grid lg:grid-cols-2'
      action={action}
      onChange={handleSave}
    >
      <label className='label'>
        <input
          className='checkbox checkbox-lg md:checkbox-xs'
          type='checkbox'
          name='containsStapleFood'
          id='containsStapleFood'
          disabled={isPending}
          defaultChecked={!!cell.row.original.containsStapleFood}
        />
        <span>Makanan pokok?</span>
      </label>
      <label className='label'>
        <input
          className='checkbox checkbox-lg md:checkbox-xs'
          type='checkbox'
          name='containsSideDish'
          id='containsSideDish'
          disabled={isPending}
          defaultChecked={!!cell.row.original.containsSideDish}
        />
        <span>Mengandung lauk-pauk?</span>
      </label>
      <label className='label'>
        <input
          className='checkbox checkbox-lg md:checkbox-xs'
          type='checkbox'
          name='containsVegetables'
          id='containsVegetables'
          disabled={isPending}
          defaultChecked={!!cell.row.original.containsVegetables}
        />
        <span>Mengandung sayuran?</span>
      </label>
      <label className='label'>
        <input
          className='checkbox checkbox-lg md:checkbox-xs'
          type='checkbox'
          name='containsFruits'
          id='containsFruits'
          disabled={isPending}
          defaultChecked={!!cell.row.original.containsFruits}
        />
        <span>Mengandung buah-buahan?</span>
      </label>
      <label className='label'>
        <input
          className='checkbox checkbox-lg md:checkbox-xs'
          type='checkbox'
          name='isFollowingRecipe'
          id='isFollowingRecipe'
          disabled={isPending}
          defaultChecked={!!cell.row.original.isFollowingRecipe}
        />
        <span>Sesuai dengan resep?</span>
      </label>
      <input
        type='hidden'
        name='patientId'
        value={cell.row.original.patientId}
      />
      <input
        type='hidden'
        name='dailyAssesmentId'
        value={cell.row.original.dailyAssesmentId}
      />
    </form>
  )
}

export default AssesmentForm
