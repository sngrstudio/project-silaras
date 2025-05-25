import { useActionState, useRef, type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { type DailyAssesments } from './assesment.store'
import { actions, isInputError } from 'astro:actions'
import { setDailyAssesments } from './assesment.store'

interface MobileListProps {
  cell: CellContext<DailyAssesments[number], unknown>
}

const MobileList: FC<MobileListProps> = ({ cell }) => {
  return (
    <>
      <div className='list-col-grow flex flex-col justify-start gap-y-1'>
        <div className='mb-2 text-lg font-bold'>
          {cell.row.original.date?.toLocaleDateString('id-ID', {
            dateStyle: 'long'
          })}
        </div>
        <div className='badge badge-soft badge-sm badge-primary rounded-full'>
          {cell.row.original.menu1}
        </div>
        <div className='badge badge-soft badge-sm badge-accent rounded-full'>
          {cell.row.original.menu2}
        </div>
      </div>

      <div className='list-col-wrap'>
        <MobileListForm cell={cell} />
      </div>

      <div>
        <div className='stats'>
          <div className='stat p-0'>
            <div className='stat-value'>{cell.row.original.score}</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileList

interface MobileListFormProps extends Pick<MobileListProps, 'cell'> {}

const MobileListForm: FC<MobileListFormProps> = ({ cell }) => {
  const formRef = useRef<HTMLFormElement>(null)

  const handleForm = async (_prev: unknown, data: FormData) => {
    const { error } = await actions.assesment.daily.set(data)
    if (error) {
      if (isInputError(error)) {
        return error
      }

      console.log(error)
      return undefined
    }

    const updatedState = await actions.assesment.daily.getAll.orThrow({
      patientSlug: window.location.pathname.split('/').at(-1) || '',
      month: 'JUNE' // temporary
    })
    setDailyAssesments(updatedState)

    console.log('success')
    return undefined
  }

  const [_error, action, isPending] = useActionState(handleForm, undefined)

  const handleCheckboxBlur = () => {
    if (formRef.current && !isPending) {
      formRef.current.requestSubmit()
    }
  }

  return (
    <form
      ref={formRef}
      className='flex w-full flex-col gap-y-1'
      action={action}
    >
      <label className='label'>
        <input
          className='checkbox'
          type='checkbox'
          name='containsStapleFood'
          id='containsStapleFood'
          disabled={isPending}
          defaultChecked={!!cell.row.original.containsStapleFood}
          onBlur={handleCheckboxBlur}
        />
        <span>Makanan pokok?</span>
      </label>
      <label className='label'>
        <input
          className='checkbox'
          type='checkbox'
          name='containsSideDish'
          id='containsSideDish'
          disabled={isPending}
          defaultChecked={!!cell.row.original.containsSideDish}
          onBlur={handleCheckboxBlur}
        />
        <span>Mengandung lauk-pauk?</span>
      </label>
      <label className='label'>
        <input
          className='checkbox'
          type='checkbox'
          name='containsVegetables'
          id='containsVegetables'
          disabled={isPending}
          defaultChecked={!!cell.row.original.containsVegetables}
          onBlur={handleCheckboxBlur}
        />
        <span>Mengandung sayuran?</span>
      </label>
      <label className='label'>
        <input
          className='checkbox'
          type='checkbox'
          name='containsFruits'
          id='containsFruits'
          disabled={isPending}
          defaultChecked={!!cell.row.original.containsFruits}
          onBlur={handleCheckboxBlur}
        />
        <span>Mengandung buah-buahan?</span>
      </label>
      <label className='label'>
        <input
          className='checkbox'
          type='checkbox'
          name='isFollowingRecipe'
          id='isFollowingRecipe'
          disabled={isPending}
          defaultChecked={!!cell.row.original.isFollowingRecipe}
          onBlur={handleCheckboxBlur}
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
