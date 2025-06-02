import { useActionState, useRef, useState, useEffect, type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import type { GetImageResult } from 'astro'
import {
  type DailyAssesments,
  setDailyAssesments,
  $currentMonthIndex
} from './assesment.store'
import { actions, isInputError } from 'astro:actions'
import Image from '~/components/common/image/image'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'
import XIcon from '~icons/lucide/x'

interface AssesmentFormProps {
  cell: CellContext<DailyAssesments[number], unknown>
  isDisabled?: boolean
}

const AssesmentForm: FC<AssesmentFormProps> = ({
  cell,
  isDisabled = false
}) => {
  const currentMonthIndex = useStore($currentMonthIndex)
  const formRef = useRef<HTMLFormElement>(null)
  const [imagePreview, setImagePreview] = useState<GetImageResult | undefined>(
    undefined
  )

  // Load existing image when component mounts or image changes
  useEffect(() => {
    if (!cell.row.original.image) {
      setImagePreview(undefined)
      return
    }

    actions.image.getPresignedImage
      .orThrow({ fileName: cell.row.original.image, width: 200, height: 150 })
      .then((image) => {
        setImagePreview(image)
      })
      .catch(() => {
        setImagePreview(undefined)
      })
  }, [cell.row.original.image])

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

    // Reset removeImage flag after successful submission
    const removeImageInput = formRef.current?.querySelector(
      'input[name="removeImage"]'
    ) as HTMLInputElement
    if (removeImageInput) {
      removeImageInput.checked = false
      delete removeImageInput.dataset.intentionallyChecked
    }

    // Clear file input to prevent re-submission
    const fileInput = formRef.current?.querySelector(
      'input[name="imageFile"]'
    ) as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }

    // Reset after successful submission
    showSuccessToast('Data asesmen berhasil disimpan!')
    return undefined
  }

  const [_error, action, isPending] = useActionState(handleForm, undefined)

  const handleFileChange = () => {
    if (!formRef.current || isPending || isDisabled) return
    const form = formRef.current
    const fileInput = form.querySelector(
      'input[name="imageFile"]'
    ) as HTMLInputElement

    // Only submit if a file was selected
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      // Ensure removeImage is unchecked when uploading new file
      const removeImageInput = form.querySelector(
        'input[name="removeImage"]'
      ) as HTMLInputElement
      if (removeImageInput) {
        removeImageInput.checked = false
        delete removeImageInput.dataset.intentionallyChecked
      }
      form.requestSubmit()
    }
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLFormElement>) => {
    if (isDisabled) return
    // Only handle changes for assessment checkboxes, not file inputs
    const target = event.target as unknown as HTMLInputElement
    if (target.type === 'checkbox' && target.name !== 'removeImage') {
      handleSave()
    }
  }

  const handleSave = () => {
    if (!formRef.current || isPending || isDisabled) return
    const form = formRef.current

    // Ensure removeImage is unchecked unless explicitly removing image
    const removeImageInput = form.querySelector(
      'input[name="removeImage"]'
    ) as HTMLInputElement
    if (removeImageInput && !removeImageInput.dataset.intentionallyChecked) {
      removeImageInput.checked = false
    }

    // Only submit if assessment checkboxes changed (not file input changes)
    const assessmentChanged =
      form.containsStapleFood.checked !==
        !!cell.row.original.containsStapleFood ||
      form.containsSideDish.checked !== !!cell.row.original.containsSideDish ||
      form.containsVegetables.checked !==
        !!cell.row.original.containsVegetables ||
      form.containsFruits.checked !== !!cell.row.original.containsFruits ||
      form.isFollowingRecipe.checked !== !!cell.row.original.isFollowingRecipe

    // Only submit if assessment checkboxes changed, not for file input changes
    if (!assessmentChanged) return
    form.requestSubmit()
  }

  return (
    <form
      ref={formRef}
      className={`flex w-full flex-col gap-y-1 md:grid lg:grid-cols-2 ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}
      action={action}
      onChange={handleFormChange}
    >
      <label className='label'>
        <input
          className='checkbox checkbox-lg md:checkbox-xs'
          type='checkbox'
          name='containsStapleFood'
          id='containsStapleFood'
          disabled={isPending || isDisabled}
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
          disabled={isPending || isDisabled}
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
          disabled={isPending || isDisabled}
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
          disabled={isPending || isDisabled}
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
          disabled={isPending || isDisabled}
          defaultChecked={!!cell.row.original.isFollowingRecipe}
        />
        <span>Sesuai dengan resep?</span>
      </label>

      {/* Image Upload Section */}
      <div className='col-span-full mt-4 mb-2 lg:col-span-2'>
        <label className='mb-1 block text-sm font-medium text-gray-700'>
          Foto Makanan (Opsional)
        </label>

        {/* Show existing image if available */}
        {imagePreview && (
          <div className='relative mb-3 inline-block'>
            <div className='overflow-hidden rounded-lg border-2 border-gray-200'>
              <Image
                image={imagePreview}
                alt='Foto makanan saat ini'
                className='max-h-36 max-w-48 object-contain'
              />
            </div>

            {/* Corner X button to remove image - disabled for future dates */}
            {!isDisabled && (
              <button
                type='button'
                onClick={() => {
                  // Set the hidden removeImage checkbox and submit
                  const removeImageInput = formRef.current?.querySelector(
                    'input[name="removeImage"]'
                  ) as HTMLInputElement
                  if (removeImageInput && formRef.current) {
                    removeImageInput.checked = true
                    removeImageInput.dataset.intentionallyChecked = 'true'
                    formRef.current.requestSubmit()
                  }
                }}
                disabled={isPending}
                className='bg-error hover:bg-error-focus text-error-content focus:ring-error absolute -top-2 -right-2 rounded-full p-1 shadow-lg transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none'
                aria-label='Hapus foto'
              >
                <XIcon className='h-4 w-4' />
              </button>
            )}

            <p className='mt-1 text-xs text-gray-500'>Foto saat ini</p>
          </div>
        )}

        <input
          type='file'
          name='imageFile'
          accept='image/*'
          disabled={isPending || isDisabled}
          onChange={handleFileChange}
          className='file:bg-primary hover:file:bg-primary-focus block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white disabled:opacity-50'
        />
      </div>

      {/* Hidden inputs */}
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
      <input
        type='checkbox'
        name='removeImage'
        className='hidden'
        defaultChecked={false}
      />
    </form>
  )
}

export default AssesmentForm
