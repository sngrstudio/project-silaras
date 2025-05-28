import { type FC, useActionState, useRef } from 'react'
import { useStore } from '@nanostores/react'
import {
  $monthlyAssesments,
  setMonthlyAssesment,
  $currentMonthIndex
} from './assesment.store'
import { actions } from 'astro:actions'

const AssesmentStatRC: FC = () => {
  const monthlyAssesments = useStore($monthlyAssesments)
  const currentMonthIndex = useStore($currentMonthIndex)
  const formRef = useRef<HTMLFormElement>(null)

  const getPatientSlug = () => window.location.pathname.split('/').at(-1) || ''

  const handleUpdate = async (_prev: unknown, formData: FormData) => {
    const { error } = await actions.assesment.monthly.set(formData)
    if (error) {
      console.log(error)
      return undefined
    }

    const state = await actions.assesment.monthly.get.orThrow({
      patientSlug: getPatientSlug(),
      monthIndex: currentMonthIndex
    })
    setMonthlyAssesment(state)
    return undefined
  }

  const [_, action, isPending] = useActionState(handleUpdate, undefined)

  const handleSave = () => {
    if (!formRef.current || isPending || !monthlyAssesments) return
    const form = formRef.current
    // Only submit if something changed
    const changed =
      parseFloat(form.height.value) !== Number(monthlyAssesments.height) ||
      parseFloat(form.weight.value) !== Number(monthlyAssesments.weight)
    if (!changed) return
    form.requestSubmit()
  }

  if (!monthlyAssesments) {
    return <></>
  }

  return (
    <form
      className='stats max-md:stats-vertical border-base-300 border max-md:w-full'
      action={action}
      ref={formRef}
      onBlur={handleSave}
      key={`form-${monthlyAssesments.monthlyAssesmentId}`}
    >
      <div className='stat place-items-center'>
        <label className='stat-title' htmlFor='height'>
          Tinggi Badan (cm)
        </label>
        <input
          className='stat-value w-[124px] text-center'
          name='height'
          id='height'
          type='number'
          step={0.1}
          min={0}
          disabled={isPending}
          defaultValue={monthlyAssesments.height}
        />
      </div>

      <div className='stat place-items-center'>
        <label className='stat-title' htmlFor='weight'>
          Berat Badan (kg)
        </label>
        <input
          className='stat-value w-[124px] text-center'
          name='weight'
          id='weight'
          type='number'
          step={0.01}
          min={0}
          disabled={isPending}
          defaultValue={monthlyAssesments.weight}
        />
      </div>

      <div className='stat place-items-center'>
        <span className='stat-title'>Indeks Massa Tubuh</span>
        <span className='stat-value'>{monthlyAssesments.bmi}</span>
      </div>

      {/* hidden */}
      <input
        type='hidden'
        name='patientId'
        value={monthlyAssesments.patientId}
      />
      <input
        type='hidden'
        name='monthlyAssesmentId'
        value={monthlyAssesments.monthlyAssesmentId}
      />
    </form>
  )
}

export default AssesmentStatRC
