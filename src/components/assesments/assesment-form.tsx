/**
 * @fileoverview Assessment Form Component
 *
 * Interactive form for daily assessment data entry with file upload capabilities,
 * real-time validation, and automatic saving. Supports multiple assessment metrics
 * including photos, nutritional components, and educational materials.
 *
 * @author SNGR Creative
 * @version 1.0.0
 */
import { useActionState, useRef, useState, useEffect, type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
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
import CheckSquareIcon from '~icons/lucide/check-square'
import CameraIcon from '~icons/lucide/camera'
import UploadIcon from '~icons/lucide/upload'
import WheatIcon from '~icons/lucide/wheat'
import DrumstickIcon from '~icons/lucide/beef'
import LeafIcon from '~icons/lucide/leaf'
import AppleIcon from '~icons/lucide/apple'
import BookOpenIcon from '~icons/lucide/book-open'
import clsx from 'clsx'

/**
 * Props interface for the AssessmentForm component
 *
 * @interface AssesmentFormProps
 */
interface AssesmentFormProps {
  /**
   * Table cell context containing assessment data for the current row.
   * Provides access to assessment information, target data, and form state.
   */
  cell: CellContext<DailyAssesments[number], unknown>

  /**
   * Whether the form should be disabled for interaction.
   * When true, prevents form submission and input modifications.
   *
   * @default false
   */
  isDisabled?: boolean
}

/**
 * Assessment Form Component
 *
 * A comprehensive form for entering daily assessment data including:
 * - Photo documentation with preview
 * - Nutritional component checkboxes (carbs, protein, vegetables, fruits)
 * - Educational material documentation
 * - Real-time validation and error handling
 * - Automatic form submission on blur events
 *
 * Features:
 * - File upload with preview functionality
 * - Cloudinary integration for image storage
 * - Form state management with useActionState
 * - Real-time error feedback
 * - Automatic saving on field blur
 * - Responsive design with mobile optimization
 * - Toast notifications for success/error states
 *
 * @component
 * @param props - Component properties
 * @param props.cell - Table cell context with assessment data
 * @param props.isDisabled - Whether form interactions should be disabled
 *
 * @example
 * ```tsx
 * // Used within assessment table cells
 * <AssesmentForm
 *   cell={cellContext}
 *   isDisabled={!canEditAssessment}
 * />
 * ```
 *
 * @see {@link DailyAssesments} - Assessment data structure
 * @see {@link actions.assesment.daily.set} - Form submission action
 */
const AssesmentForm: FC<AssesmentFormProps> = ({
  cell,
  isDisabled = false
}) => {
  const currentMonthIndex = useStore($currentMonthIndex)
  const formRef = useRef<HTMLFormElement>(null)

  // Simple state for file selection and preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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
      targetSlug: window.location.pathname.split('/').at(-1) || '',
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

    // Only reset file-related state if a file was actually uploaded
    const fileInput = formRef.current?.querySelector(
      'input[name="imageFile"]'
    ) as HTMLInputElement
    const hasFileData =
      data.get('imageFile') instanceof File &&
      (data.get('imageFile') as File).size > 0

    if (hasFileData && fileInput) {
      // Clear file input to prevent re-submission
      fileInput.value = ''

      // Don't reset selectedFile and previewUrl immediately
      // Let them persist so the preview remains visible until the page refreshes
      // or user navigates away. The server now has the image, so the preview
      // serves as confirmation that the upload was successful.
    }

    // Reset after successful submission
    showSuccessToast('Data asesmen berhasil disimpan!')
    return undefined
  }

  const [_error, action, isPending] = useActionState(handleForm, undefined)

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isPending || isDisabled) {
      return
    }

    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSelectedFile(file)

    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Auto-submit after 3 seconds
    if (formRef.current) {
      const form = formRef.current

      // Ensure removeImage is unchecked when uploading new file
      const removeImageInput = form.querySelector(
        'input[name="removeImage"]'
      ) as HTMLInputElement
      if (removeImageInput) {
        removeImageInput.checked = false
        delete removeImageInput.dataset.intentionallyChecked
      }

      // Store current file in closure to avoid race conditions
      const currentFile = file
      setTimeout(() => {
        // Check if form still exists and file input still has the same file
        if (formRef.current) {
          const fileInput = formRef.current.querySelector(
            'input[name="imageFile"]'
          ) as HTMLInputElement
          // Submit if file input still has files or if we have the original file
          if (
            (fileInput && fileInput.files && fileInput.files.length > 0) ||
            currentFile
          ) {
            formRef.current.requestSubmit()
          }
        }
      }, 3000)
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
    <div className='flex flex-col gap-4'>
      {/* Assessment Criteria Section */}
      <div className='bg-base-100 border-base-300/50 rounded-lg border p-4'>
        <div className='mb-3 flex items-center gap-2'>
          <CheckSquareIcon className='text-info h-4 w-4' />
          <span className='text-base-content/80 text-sm font-semibold'>
            Kriteria Penilaian
          </span>
        </div>

        {/* Form submission status */}
        {isPending && (
          <div className='mb-3 flex items-center gap-2'>
            <div className='loading loading-spinner loading-xs text-base-content/50'></div>
            <span className='text-base-content/50 text-xs'>
              Menyimpan perubahan kriteria penilaian...
            </span>
          </div>
        )}

        <form
          ref={formRef}
          className={clsx(
            'space-y-4',
            isDisabled && 'pointer-events-none opacity-50'
          )}
          action={action}
          onChange={handleFormChange}
        >
          {/* Assessment Checkboxes - Card Layout */}
          <div className='grid gap-3 sm:grid-cols-2'>
            {/* First Row */}
            <label className='card card-compact border-base-200 bg-base-50 hover:border-primary/50 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/10 cursor-pointer border-2 transition-all duration-200 hover:shadow-md has-[:checked]:shadow-lg'>
              <div className='card-body flex-row items-center gap-3'>
                <input
                  className='checkbox checkbox-primary'
                  type='checkbox'
                  name='containsStapleFood'
                  id='containsStapleFood'
                  disabled={isPending || isDisabled}
                  defaultChecked={!!cell.row.original.containsStapleFood}
                />
                <WheatIcon className='h-5 w-5 flex-shrink-0 text-amber-600' />
                <div className='flex-1'>
                  <span className='text-base-content text-sm font-semibold'>
                    Makanan pokok
                  </span>
                  <div className='text-base-content/60 text-xs'>
                    Nasi, roti, kentang
                  </div>
                </div>
              </div>
            </label>

            <label className='card card-compact border-base-200 bg-base-50 hover:border-primary/50 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/10 cursor-pointer border-2 transition-all duration-200 hover:shadow-md has-[:checked]:shadow-lg'>
              <div className='card-body flex-row items-center gap-3'>
                <input
                  className='checkbox checkbox-primary'
                  type='checkbox'
                  name='containsSideDish'
                  id='containsSideDish'
                  disabled={isPending || isDisabled}
                  defaultChecked={!!cell.row.original.containsSideDish}
                />
                <DrumstickIcon className='h-5 w-5 flex-shrink-0 text-red-600' />
                <div className='flex-1'>
                  <span className='text-base-content text-sm font-semibold'>
                    Lauk-pauk
                  </span>
                  <div className='text-base-content/60 text-xs'>
                    Protein hewani/nabati
                  </div>
                </div>
              </div>
            </label>

            {/* Second Row */}
            <label className='card card-compact border-base-200 bg-base-50 hover:border-primary/50 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/10 cursor-pointer border-2 transition-all duration-200 hover:shadow-md has-[:checked]:shadow-lg'>
              <div className='card-body flex-row items-center gap-3'>
                <input
                  className='checkbox checkbox-primary'
                  type='checkbox'
                  name='containsVegetables'
                  id='containsVegetables'
                  disabled={isPending || isDisabled}
                  defaultChecked={!!cell.row.original.containsVegetables}
                />
                <LeafIcon className='h-5 w-5 flex-shrink-0 text-green-600' />
                <div className='flex-1'>
                  <span className='text-base-content text-sm font-semibold'>
                    Sayuran
                  </span>
                  <div className='text-base-content/60 text-xs'>
                    Sayuran hijau & warna
                  </div>
                </div>
              </div>
            </label>

            <label className='card card-compact border-base-200 bg-base-50 hover:border-primary/50 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/10 cursor-pointer border-2 transition-all duration-200 hover:shadow-md has-[:checked]:shadow-lg'>
              <div className='card-body flex-row items-center gap-3'>
                <input
                  className='checkbox checkbox-primary'
                  type='checkbox'
                  name='containsFruits'
                  id='containsFruits'
                  disabled={isPending || isDisabled}
                  defaultChecked={!!cell.row.original.containsFruits}
                />
                <AppleIcon className='h-5 w-5 flex-shrink-0 text-orange-500' />
                <div className='flex-1'>
                  <span className='text-base-content text-sm font-semibold'>
                    Buah-buahan
                  </span>
                  <div className='text-base-content/60 text-xs'>
                    Buah segar atau olahan
                  </div>
                </div>
              </div>
            </label>
          </div>

          {/* Recipe Following - Full Width */}
          <label className='card card-compact border-base-200 bg-base-50 hover:border-primary/50 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/10 cursor-pointer border-2 transition-all duration-200 hover:shadow-md has-[:checked]:shadow-lg'>
            <div className='card-body flex-row items-center gap-3'>
              <input
                className='checkbox checkbox-primary'
                type='checkbox'
                name='isFollowingRecipe'
                id='isFollowingRecipe'
                disabled={isPending || isDisabled}
                defaultChecked={!!cell.row.original.isFollowingRecipe}
              />
              <BookOpenIcon className='h-5 w-5 flex-shrink-0 text-blue-600' />
              <div className='flex-1'>
                <span className='text-base-content text-sm font-semibold'>
                  Sesuai dengan resep
                </span>
                <div className='text-base-content/60 text-xs'>
                  Mengikuti panduan resep yang diberikan
                </div>
              </div>
            </div>
          </label>

          {/* Hidden inputs */}
          <input
            type='hidden'
            name='targetId'
            value={cell.row.original.targetId}
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

          {/* File upload input - moved inside form */}
          <input
            type='file'
            name='imageFile'
            accept='image/*'
            disabled={isPending || isDisabled}
            onChange={handleFileChange}
            className='hidden'
            id={`imageFile-${cell.row.original.dailyAssesmentId}`}
          />
        </form>
      </div>

      {/* Image Upload Section */}
      <div className='bg-base-100 border-base-300/50 rounded-lg border p-4'>
        <div className='mb-3 flex items-center gap-2'>
          <CameraIcon className='text-secondary h-4 w-4' />
          <span className='text-base-content/80 text-sm font-semibold'>
            Foto
          </span>
          <span className='badge badge-outline badge-xs'>Opsional</span>
        </div>

        {/* Show selected file preview above existing image */}
        {selectedFile && previewUrl && (
          <div className='mb-4'>
            <div className='relative'>
              <div className='border-success ring-success/30 overflow-hidden rounded-lg border-2 shadow-lg ring-2'>
                <img
                  src={previewUrl}
                  alt='Preview foto yang akan disimpan'
                  className='bg-base-200/30 aspect-[4/3] w-full object-contain'
                />
              </div>
              <div className='bg-success text-success-content absolute -top-2 left-1/2 flex -translate-x-1/2 transform items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-lg'>
                {isPending && (
                  <div className='loading loading-spinner loading-xs'></div>
                )}
                {isPending ? 'MENYIMPAN...' : 'BARU'}
              </div>
            </div>
          </div>
        )}

        {/* Show existing image if available and no new file selected */}
        {cell.row.original.image && !selectedFile && (
          <div className='mb-4'>
            <div className='relative w-full'>
              <div className='border-base-300/50 ring-base-300/20 overflow-hidden rounded-lg border-2 shadow-lg ring-2'>
                <Image
                  publicId={cell.row.original.image}
                  width={300}
                  height={400}
                  sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 400px'
                  breakpoints={[300, 400, 500, 600]}
                  alt='Foto saat ini'
                  className='bg-base-200/30 aspect-[4/3] w-full object-cover'
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
                  className='btn btn-circle btn-xs btn-error absolute -top-2 -right-2 z-10 shadow-lg transition-all duration-200 hover:scale-110'
                  aria-label='Hapus foto'
                >
                  <XIcon className='h-3 w-3' />
                </button>
              )}
            </div>
          </div>
        )}

        {/* File upload input */}
        <div className='relative'>
          <label
            htmlFor={`imageFile-${cell.row.original.dailyAssesmentId}`}
            className={clsx(
              'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 transition-all duration-200 md:p-4',
              isPending || isDisabled
                ? 'border-base-300/30 bg-base-200/30 cursor-not-allowed opacity-50'
                : selectedFile
                  ? 'border-success bg-success/10 ring-success/20 ring-2'
                  : 'border-base-300 hover:border-primary hover:bg-primary/5'
            )}
          >
            <UploadIcon
              className={clsx(
                'h-4 w-4',
                isPending || isDisabled
                  ? 'text-base-content/30'
                  : selectedFile
                    ? 'text-success'
                    : 'text-primary'
              )}
            />
            <div className='flex flex-col items-center gap-1'>
              <span
                className={clsx(
                  'text-sm font-medium',
                  isPending || isDisabled
                    ? 'text-base-content/30'
                    : selectedFile
                      ? 'text-success'
                      : 'text-base-content/70'
                )}
              >
                {selectedFile
                  ? `File terpilih: ${selectedFile.name}`
                  : cell.row.original.image
                    ? 'Ganti foto'
                    : 'Upload foto'}
              </span>
              {selectedFile && (
                <span className='text-success text-xs font-medium'>
                  ✓ Siap untuk disimpan
                </span>
              )}
            </div>
          </label>
        </div>

        <div className='text-base-content/50 mt-2 text-xs'>
          Format yang didukung: JPG, PNG, WebP (Maks. 5MB)
        </div>
      </div>
    </div>
  )
}

export default AssesmentForm
