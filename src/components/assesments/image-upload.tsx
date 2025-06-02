import { useState, useRef, useEffect, type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import type { GetImageResult } from 'astro'
import {
  type DailyAssesments,
  setDailyAssesments,
  $currentMonthIndex
} from './assesment.store'
import { actions } from 'astro:actions'
import Image from '~/components/common/image/image'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'

interface ImageUploadProps {
  cell: CellContext<DailyAssesments[number], unknown>
}

const ImageUpload: FC<ImageUploadProps> = ({ cell }) => {
  const currentMonthIndex = useStore($currentMonthIndex)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(
    cell.row.original.image || null
  )
  const [imagePreview, setImagePreview] = useState<GetImageResult | undefined>(
    undefined
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load image when imageUrl changes
  useEffect(() => {
    if (!imageUrl) {
      setImagePreview(undefined)
      return
    }

    actions.image.getPresignedImage
      .orThrow({ fileName: imageUrl, width: 64, height: 64 })
      .then((image) => {
        setImagePreview(image)
      })
      .catch(() => {
        setImagePreview(undefined)
      })
  }, [imageUrl])

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showErrorToast('File harus berupa gambar.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Ukuran file maksimal 5MB.')
      return
    }

    setUploading(true)
    try {
      // First upload the image
      const formData = new FormData()
      formData.append('file', file)
      formData.append('patientId', cell.row.original.patientId)

      const { data: fileName, error: uploadError } =
        await actions.assesment.daily.uploadImage(formData)

      if (uploadError || !fileName) {
        throw new Error('Gagal mengunggah gambar.')
      }

      // Then update the assessment with the image filename
      const updateFormData = new FormData()
      updateFormData.append('patientId', cell.row.original.patientId)
      updateFormData.append(
        'dailyAssesmentId',
        cell.row.original.dailyAssesmentId
      )
      updateFormData.append(
        'containsStapleFood',
        cell.row.original.containsStapleFood?.toString() || 'false'
      )
      updateFormData.append(
        'containsSideDish',
        cell.row.original.containsSideDish?.toString() || 'false'
      )
      updateFormData.append(
        'containsVegetables',
        cell.row.original.containsVegetables?.toString() || 'false'
      )
      updateFormData.append(
        'containsFruits',
        cell.row.original.containsFruits?.toString() || 'false'
      )
      updateFormData.append(
        'isFollowingRecipe',
        cell.row.original.isFollowingRecipe?.toString() || 'false'
      )
      updateFormData.append('image', fileName)

      const { error: updateError } =
        await actions.assesment.daily.set(updateFormData)

      if (updateError) {
        // Delete the uploaded file if assessment update fails
        await actions.assesment.daily.deleteImage({ fileName })
        throw new Error('Gagal menyimpan data penilaian.')
      }

      // Delete old image if exists
      if (imageUrl && imageUrl !== fileName) {
        await actions.assesment.daily.deleteImage({ fileName: imageUrl })
      }

      setImageUrl(fileName)

      // Refresh the assessment data
      const updatedState = await actions.assesment.daily.getAll.orThrow({
        patientSlug: window.location.pathname.split('/').at(-1) || '',
        monthIndex: currentMonthIndex
      })
      setDailyAssesments(updatedState)

      showSuccessToast('Gambar berhasil diunggah!')
    } catch (error) {
      showErrorToast(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat mengunggah gambar.'
      )
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImageClick = () => {
    if (uploading) return
    fileInputRef.current?.click()
  }

  const handleRemoveImage = async () => {
    if (!imageUrl || uploading) return

    setUploading(true)
    try {
      // Update assessment to remove image
      const updateFormData = new FormData()
      updateFormData.append('patientId', cell.row.original.patientId)
      updateFormData.append(
        'dailyAssesmentId',
        cell.row.original.dailyAssesmentId
      )
      updateFormData.append(
        'containsStapleFood',
        cell.row.original.containsStapleFood?.toString() || 'false'
      )
      updateFormData.append(
        'containsSideDish',
        cell.row.original.containsSideDish?.toString() || 'false'
      )
      updateFormData.append(
        'containsVegetables',
        cell.row.original.containsVegetables?.toString() || 'false'
      )
      updateFormData.append(
        'containsFruits',
        cell.row.original.containsFruits?.toString() || 'false'
      )
      updateFormData.append(
        'isFollowingRecipe',
        cell.row.original.isFollowingRecipe?.toString() || 'false'
      )
      // Don't include image field to set it to null

      const { error: updateError } =
        await actions.assesment.daily.set(updateFormData)

      if (updateError) {
        throw new Error('Gagal menyimpan data penilaian.')
      }

      // Delete the image file
      await actions.assesment.daily.deleteImage({ fileName: imageUrl })

      setImageUrl(null)

      // Refresh the assessment data
      const updatedState = await actions.assesment.daily.getAll.orThrow({
        patientSlug: window.location.pathname.split('/').at(-1) || '',
        monthIndex: currentMonthIndex
      })
      setDailyAssesments(updatedState)

      showSuccessToast('Gambar berhasil dihapus!')
    } catch (error) {
      showErrorToast(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menghapus gambar.'
      )
    } finally {
      setUploading(false)
    }
  }

  if (imageUrl && imagePreview) {
    return (
      <div className='group relative'>
        <div
          className='hover:border-primary-300 h-16 w-16 cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 transition-colors md:h-12 md:w-12'
          onClick={handleImageClick}
        >
          <Image
            image={imagePreview}
            alt='Assessment'
            className='h-full w-full object-cover'
          />
        </div>
        <button
          type='button'
          onClick={handleRemoveImage}
          disabled={uploading}
          className='bg-error hover:bg-error-focus absolute -top-2 -right-2 h-6 w-6 rounded-full text-xs text-white opacity-0 transition-colors group-hover:opacity-100 disabled:opacity-50'
          title='Hapus gambar'
        >
          ×
        </button>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          className='hidden'
        />
      </div>
    )
  }

  return (
    <div className='h-16 w-16 md:h-12 md:w-12'>
      <button
        type='button'
        onClick={handleImageClick}
        disabled={uploading}
        className='hover:border-primary-300 flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors disabled:opacity-50'
        title='Upload gambar'
      >
        {uploading ? (
          <div className='loading loading-spinner loading-sm'></div>
        ) : (
          <svg
            className='h-6 w-6 text-gray-400 md:h-4 md:w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 6v6m0 0v6m0-6h6m-6 0H6'
            />
          </svg>
        )}
      </button>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        className='hidden'
      />
    </div>
  )
}

export default ImageUpload
