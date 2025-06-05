import {
  useActionState,
  useEffect,
  useState,
  type Dispatch,
  type FC,
  type SetStateAction
} from 'react'
import DialogComponent from '~/components/common/dialog/dialog'
import { useStore } from '@nanostores/react'
import {
  $currentTarget,
  setCurrentTarget,
  $currentRegion,
  setTargets,
  $openTargetModal
} from './target.store'
import { actions, isInputError } from 'astro:actions'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  showErrorToast,
  showSuccessToast
} from '~/components/common/toast/toast.store'
import IconUser from '~icons/lucide/user'
import IconEdit from '~icons/lucide/edit'
import IconTag from '~icons/lucide/tag'
import IconRuler from '~icons/lucide/ruler'
import IconMap from '~icons/lucide/map'
import IconMapPin from '~icons/lucide/map-pin'
import IconHome from '~icons/lucide/home'
import IconPhone from '~icons/lucide/phone'
import IconSmartphone from '~icons/lucide/smartphone'
import IconSave from '~icons/lucide/save'
import IconX from '~icons/lucide/x'
import IconTrash from '~icons/lucide/trash'
import IconAlertTriangle from '~icons/lucide/alert-triangle'
import IconLoader from '~icons/lucide/loader'
import IconActivity from '~icons/lucide/activity'
import IconHeart from '~icons/lucide/heart'
import IconCake from '~icons/lucide/cake'
import IconWeight from '~icons/lucide/weight'
import IconBaby from '~icons/lucide/baby'
import IconMilk from '~icons/lucide/milk'
import IconUsers from '~icons/lucide/users'

// Fix marker icons for production build using Lucide MapPin icon
const markerIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
  shadowUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41" width="41" height="41">
      <ellipse cx="20.5" cy="37" rx="13" ry="4" fill="rgba(0,0,0,0.2)"/>
    </svg>
  `),
  shadowSize: [41, 41],
  shadowAnchor: [13, 41]
})

// Set the default icon for all markers
L.Marker.prototype.options.icon = markerIcon

const TargetDialog: FC = () => {
  const currentRegion = useStore($currentRegion)
  const currentTarget = useStore($currentTarget)
  const openTargetModal = useStore($openTargetModal)

  // Initialize with safe defaults to prevent hydration mismatch
  const [latLng, setLatLng] = useState<L.LatLng>({
    lat: 0,
    lng: 0
  } as L.LatLng)
  const [address, setAddress] = useState<string>('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    document.addEventListener('astro:page-load', () => {
      setCurrentTarget(undefined)
    })
  })

  // Update all state when current target changes to prevent hydration mismatch
  useEffect(() => {
    if (currentTarget) {
      setLatLng({
        lat: currentTarget.latitude ?? 0,
        lng: currentTarget.longitude ?? 0
      } as L.LatLng)
      setSelectedStatus(currentTarget.status || '')
      setAddress(currentTarget.address || '')
    } else {
      // Reset to defaults when no target is selected
      setLatLng({ lat: 0, lng: 0 } as L.LatLng)
      setSelectedStatus('')
      setAddress('')
    }
  }, [currentTarget])

  // Function to get address from coordinates using reverse geocoding
  const getAddressFromCoords = async (
    lat: number,
    lng: number
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return data.display_name || ''
    } catch (error) {
      console.error('Error getting address:', error)
      showErrorToast(
        'Gagal mendapatkan alamat dari koordinat. Silakan masukkan alamat secara manual.'
      )
      return ''
    }
  }

  // Function to get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showErrorToast('Geolocation tidak didukung oleh browser ini.')
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const newLatLng = { lat: latitude, lng: longitude } as L.LatLng

        setLatLng(newLatLng)

        // Get address from coordinates
        const addressFromCoords = await getAddressFromCoords(
          latitude,
          longitude
        )
        if (addressFromCoords) {
          setAddress(addressFromCoords)
          showSuccessToast('Lokasi dan alamat berhasil didapatkan!')
        } else {
          showSuccessToast(
            'Lokasi berhasil didapatkan! Silakan masukkan alamat secara manual.'
          )
        }

        setIsGettingLocation(false)
      },
      (error) => {
        setIsGettingLocation(false)
        let errorMessage = 'Gagal mendapatkan lokasi.'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Akses lokasi ditolak. Mohon berikan izin lokasi.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia.'
            break
          case error.TIMEOUT:
            errorMessage = 'Waktu permintaan lokasi habis.'
            break
        }

        showErrorToast(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const handleSubmit = async (_prev: unknown, formData: FormData) => {
    const { data, error } = await actions.target.upsert(formData)
    if (error && !data) {
      if (isInputError(error)) {
        return error
      }

      showErrorToast('Terjadi kesalahan saat menyimpan data sasaran.')
      return undefined
    }

    const updatedTargets = await actions.target.getAll.orThrow({
      regionSlug: currentRegion?.slug ?? ''
    })
    setTargets(updatedTargets)
    setCurrentTarget(undefined)
    showSuccessToast(
      currentTarget?.id
        ? 'Data sasaran berhasil diperbarui!'
        : 'Sasaran baru berhasil ditambahkan!'
    )
    return undefined
  }

  // Delete handler function
  const handleDelete = async () => {
    if (!currentTarget?.id) return

    const confirmed = confirm(
      `Apakah Anda yakin ingin menghapus sasaran "${currentTarget.name}"?\n\nTindakan ini akan menghapus:\n- Data sasaran\n- Semua penilaian harian dan bulanan\n- Semua gambar terkait\n\nTindakan ini tidak dapat dibatalkan.`
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      const { error } = await actions.target.delete({ id: currentTarget.id })

      if (error) {
        showErrorToast('Terjadi kesalahan saat menghapus data sasaran.')
        return
      }

      // Refresh the targets list
      const updatedTargets = await actions.target.getAll.orThrow({
        regionSlug: currentRegion?.slug ?? ''
      })
      setTargets(updatedTargets)
      setCurrentTarget(undefined)
      showSuccessToast('Data sasaran berhasil dihapus!')
    } catch (error) {
      console.error('Delete error:', error)
      showErrorToast('Terjadi kesalahan saat menghapus data sasaran.')
    } finally {
      setIsDeleting(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, action, isPending] = useActionState(handleSubmit, undefined)

  if (!currentTarget || !currentRegion) {
    return <></>
  }

  return (
    <DialogComponent
      title='Tambah atau Ubah Sasaran'
      description='Lengkapi formulir berikut untuk menambah atau mengubah data sasaran. Semua field yang ditandai wajib diisi.'
      open={openTargetModal}
      onOpenChange={(open) => !open && setCurrentTarget(undefined)}
    >
      <form className='flex flex-col gap-6 p-1' action={action}>
        {/* Personal Information Section */}
        <fieldset className='border-primary/20 from-primary/5 to-primary/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
          <legend className='border-primary/30 bg-base-100 text-primary flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
            <IconUser className='h-5 w-5' />
            <span>Informasi Personal</span>
          </legend>

          {/* Nama */}
          <div className='space-y-2'>
            <label
              className='label text-base-content font-medium'
              htmlFor='name'
            >
              <span className='flex items-center gap-2'>
                <IconEdit className='text-primary h-4 w-4' />
                Nama Sasaran
              </span>
            </label>
            <input
              id='name'
              name='name'
              className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
              type='text'
              defaultValue={currentTarget.name}
              disabled={isPending}
              required
              minLength={2}
              pattern='[a-zA-Z\s]+'
              placeholder='Masukkan nama lengkap'
              title='Nama hanya boleh mengandung huruf dan spasi, minimal 2 karakter'
            />
            {error && error.fields.name && (
              <div className='label text-error text-sm'>
                <span className='flex items-center gap-1'>
                  <IconAlertTriangle className='h-3 w-3' />
                  {error.fields.name.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Nama Ibu */}
          <div className='space-y-2'>
            <label
              className='label text-base-content font-medium'
              htmlFor='motherName'
            >
              <span className='flex items-center gap-2'>
                <IconHeart className='text-primary h-4 w-4' />
                Nama Ibu
              </span>
            </label>
            <input
              id='motherName'
              name='motherName'
              className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
              type='text'
              defaultValue={currentTarget.motherName}
              disabled={isPending}
              required
              minLength={2}
              pattern='[a-zA-Z\s]+'
              placeholder='Masukkan nama ibu'
              title='Nama hanya boleh mengandung huruf dan spasi, minimal 2 karakter'
            />
            {error && error.fields.motherName && (
              <div className='label text-error text-sm'>
                <span className='flex items-center gap-1'>
                  <IconAlertTriangle className='h-3 w-3' />
                  {error.fields.motherName.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Tanggal Lahir */}
          <div className='space-y-2'>
            <label
              className='label text-base-content font-medium'
              htmlFor='birthDate'
            >
              <span className='flex items-center gap-2'>
                <IconCake className='text-primary h-4 w-4' />
                Tanggal Lahir
              </span>
            </label>
            <input
              id='birthDate'
              name='birthDate'
              className='input input-bordered border-primary/30 bg-base-100 focus:border-primary focus:ring-primary/20 validator w-full transition-all duration-200 focus:ring-2'
              type='date'
              defaultValue={
                typeof currentTarget.birthDate === 'string'
                  ? (currentTarget.birthDate as string).slice(0, 10)
                  : currentTarget.birthDate?.toISOString().slice(0, 10)
              }
              disabled={isPending}
              required
              max={new Date().toISOString().split('T')[0]}
            />
            {error && error.fields.birthDate && (
              <div className='label text-error text-sm'>
                <span className='flex items-center gap-1'>
                  <IconAlertTriangle className='h-3 w-3' />
                  {error.fields.birthDate.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className='space-y-3'>
            <label className='label text-base-content font-medium'>
              <span className='flex items-center gap-2'>
                <IconTag className='text-primary h-4 w-4' />
                Status
              </span>
            </label>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              {/* Hamil Status Card */}
              <label className='relative cursor-pointer'>
                <input
                  type='radio'
                  name='status'
                  value='HAMIL'
                  checked={selectedStatus === 'HAMIL'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isPending}
                  required
                  className='sr-only'
                />
                <div
                  className={`card card-compact h-24 border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                    selectedStatus === 'HAMIL'
                      ? 'border-primary bg-primary/20 text-primary ring-primary/30 shadow-lg ring-2'
                      : 'border-base-300 bg-base-100 hover:border-primary'
                  }`}
                >
                  <div className='card-body items-center justify-center p-3 text-center'>
                    <IconUsers className='h-8 w-8 transition-colors duration-200' />
                    <div className='flex flex-col items-center'>
                      <span className='font-medium'>Hamil</span>
                      <span className='text-xs opacity-60'>Ibu Hamil</span>
                    </div>
                  </div>
                </div>
                {/* Selected indicator */}
                {selectedStatus === 'HAMIL' && (
                  <div className='bg-primary text-primary-content absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full shadow-md'>
                    <svg
                      className='h-3 w-3'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                )}
              </label>

              {/* Menyusui Status Card */}
              <label className='relative cursor-pointer'>
                <input
                  type='radio'
                  name='status'
                  value='MENYUSUI'
                  checked={selectedStatus === 'MENYUSUI'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isPending}
                  required
                  className='sr-only'
                />
                <div
                  className={`card card-compact h-24 border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                    selectedStatus === 'MENYUSUI'
                      ? 'border-accent bg-accent/20 text-accent ring-accent/30 shadow-lg ring-2'
                      : 'border-base-300 bg-base-100 hover:border-accent'
                  }`}
                >
                  <div className='card-body items-center justify-center p-3 text-center'>
                    <IconMilk className='h-8 w-8 transition-colors duration-200' />
                    <div className='flex flex-col items-center'>
                      <span className='font-medium'>Menyusui</span>
                      <span className='text-xs opacity-60'>Ibu Menyusui</span>
                    </div>
                  </div>
                </div>
                {/* Selected indicator */}
                {selectedStatus === 'MENYUSUI' && (
                  <div className='bg-accent text-accent-content absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full shadow-md'>
                    <svg
                      className='h-3 w-3'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                )}
              </label>

              {/* Baduta Status Card */}
              <label className='relative cursor-pointer'>
                <input
                  type='radio'
                  name='status'
                  value='ANAK-ANAK'
                  checked={selectedStatus === 'ANAK-ANAK'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isPending}
                  required
                  className='sr-only'
                />
                <div
                  className={`card card-compact h-24 border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                    selectedStatus === 'ANAK-ANAK'
                      ? 'border-success bg-success/20 text-success ring-success/30 shadow-lg ring-2'
                      : 'border-base-300 bg-base-100 hover:border-success'
                  }`}
                >
                  <div className='card-body items-center justify-center p-3 text-center'>
                    <IconBaby className='h-8 w-8 transition-colors duration-200' />
                    <div className='flex flex-col items-center'>
                      <span className='font-medium'>Baduta</span>
                      <span className='text-xs opacity-60'>
                        Bawah Dua Tahun
                      </span>
                    </div>
                  </div>
                </div>
                {/* Selected indicator */}
                {selectedStatus === 'ANAK-ANAK' && (
                  <div className='bg-success text-success-content absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full shadow-md'>
                    <svg
                      className='h-3 w-3'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                )}
              </label>
            </div>
            {error && error.fields.status && (
              <div className='label text-error text-sm'>
                <span className='flex items-center gap-1'>
                  <IconAlertTriangle className='h-3 w-3' />
                  {error.fields.status.join(', ')}
                </span>
              </div>
            )}
          </div>
        </fieldset>

        {/* Health Metrics Section */}
        <fieldset className='border-info/20 from-info/5 to-info/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
          <legend className='border-info/30 bg-base-100 text-info flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
            <IconActivity className='h-5 w-5' />
            <span>Data Kesehatan</span>
          </legend>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Initial Weight */}
            <div className='space-y-2'>
              <label
                className='label text-base-content font-medium'
                htmlFor='initialWeight'
              >
                <span className='flex items-center gap-2'>
                  <IconWeight className='text-info h-4 w-4' />
                  Berat Badan Awal
                </span>
              </label>
              <div className='relative'>
                <input
                  id='initialWeight'
                  name='initialWeight'
                  className='input input-bordered border-info/30 bg-base-100 focus:border-info focus:ring-info/20 validator w-full pr-12 transition-all duration-200 focus:ring-2'
                  type='number'
                  step='0.01'
                  min='0.01'
                  defaultValue={currentTarget.initialWeight}
                  disabled={isPending}
                  required
                  placeholder='0.00'
                  title='Masukkan berat badan dalam kilogram (harus lebih dari 0)'
                />
                <span className='text-base-content/60 absolute top-1/2 right-3 -translate-y-1/2 text-sm'>
                  kg
                </span>
              </div>
              {error && error.fields.initialWeight && (
                <div className='label text-error text-sm'>
                  <span className='flex items-center gap-1'>
                    <IconAlertTriangle className='h-3 w-3' />
                    {error.fields.initialWeight.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Initial Height */}
            <div className='space-y-2'>
              <label
                className='label text-base-content font-medium'
                htmlFor='initialHeight'
              >
                <span className='flex items-center gap-2'>
                  <IconRuler className='text-info h-4 w-4' />
                  Tinggi Badan Awal
                </span>
              </label>
              <div className='relative'>
                <input
                  id='initialHeight'
                  name='initialHeight'
                  className='input input-bordered border-info/30 bg-base-100 focus:border-info focus:ring-info/20 validator w-full pr-12 transition-all duration-200 focus:ring-2'
                  type='number'
                  step='0.1'
                  min='0.1'
                  defaultValue={currentTarget.initialHeight}
                  disabled={isPending}
                  required
                  placeholder='0.0'
                  title='Masukkan tinggi badan dalam sentimeter (harus lebih dari 0)'
                />
                <span className='text-base-content/60 absolute top-1/2 right-3 -translate-y-1/2 text-sm'>
                  cm
                </span>
              </div>
              {error && error.fields.initialHeight && (
                <div className='label text-error text-sm'>
                  <span className='flex items-center gap-1'>
                    <IconAlertTriangle className='h-3 w-3' />
                    {error.fields.initialHeight.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* Location Section */}
        <fieldset className='border-accent/20 from-accent/5 to-accent/10 space-y-4 rounded-lg border bg-gradient-to-r p-4'>
          <div className='flex items-center justify-between'>
            <legend className='border-accent/30 bg-base-100 text-accent flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
              <IconMap className='h-5 w-5' />
              <span>Informasi Lokasi</span>
            </legend>
            <button
              type='button'
              className={`btn btn-sm transition-all duration-200 ${
                isGettingLocation
                  ? 'btn-disabled bg-accent/20 text-accent/60'
                  : 'btn-outline btn-accent hover:btn-accent hover:scale-105'
              }`}
              onClick={getCurrentLocation}
              disabled={isPending || isGettingLocation}
            >
              {isGettingLocation ? (
                <>
                  <IconLoader className='h-4 w-4 animate-spin' />
                  <span className='hidden sm:inline'>
                    Mendapatkan Lokasi...
                  </span>
                  <span className='sm:hidden'>Loading...</span>
                </>
              ) : (
                <>
                  <IconMapPin className='h-4 w-4' />
                  <span className='hidden sm:inline'>
                    Gunakan Lokasi Saat Ini
                  </span>
                  <span className='sm:hidden'>Lokasi</span>
                </>
              )}
            </button>
          </div>

          <div
            className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
              isGettingLocation
                ? 'border-accent shadow-lg'
                : 'border-accent/30 hover:border-accent/50'
            }`}
          >
            <MapContainer
              className={`aspect-[4/3] w-full transition-all duration-200 ${
                isGettingLocation ? 'pointer-events-none opacity-50' : ''
              }`}
              center={[
                currentTarget.latitude || -2.537956,
                currentTarget.longitude || 112.940995
              ]}
              zoom={20}
            >
              <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              />
              <LocationMarker
                setLatLng={setLatLng}
                setAddress={setAddress}
                getAddressFromCoords={getAddressFromCoords}
                currentLatLng={latLng}
                initialLatLng={
                  currentTarget
                    ? ({
                        lat: currentTarget.latitude,
                        lng: currentTarget.longitude
                      } as L.LatLng)
                    : ({
                        lat: -2.537956,
                        lng: 112.940995
                      } as L.LatLng)
                }
              />
            </MapContainer>
            {isGettingLocation && (
              <div className='bg-base-100/80 absolute inset-0 flex items-center justify-center backdrop-blur-sm'>
                <div className='text-accent flex flex-col items-center gap-3'>
                  <IconLoader className='h-8 w-8 animate-spin' />
                  <span className='font-medium'>Mengambil lokasi Anda...</span>
                </div>
              </div>
            )}
          </div>

          <input type='hidden' name='latitude' value={latLng.lat} />
          <input type='hidden' name='longitude' value={latLng.lng} />
          {error && (error.fields.latitude || error.fields.longitude) && (
            <div className='label text-error text-sm'>
              <span className='flex items-center gap-1'>
                <IconAlertTriangle className='h-3 w-3' />
                {[
                  ...(error.fields.latitude ?? []),
                  ...(error.fields.longitude ?? [])
                ].join(', ')}
              </span>
            </div>
          )}

          {/* Alamat */}
          <div className='space-y-2'>
            <label
              className='label text-base-content font-medium'
              htmlFor='address'
            >
              <span className='flex items-center gap-2'>
                <IconHome className='text-accent h-4 w-4' />
                Alamat
              </span>
            </label>
            <textarea
              id='address'
              name='address'
              className='textarea textarea-bordered border-accent/30 bg-base-100 focus:border-accent focus:ring-accent/20 min-h-[80px] w-full resize-none transition-all duration-200 focus:ring-2'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isPending || isGettingLocation}
              placeholder='Alamat akan terisi otomatis saat menggunakan lokasi saat ini, atau masukkan secara manual'
              rows={3}
            />
            {error && error.fields.address && (
              <div className='label text-error text-sm'>
                <span className='flex items-center gap-1'>
                  <IconAlertTriangle className='h-3 w-3' />
                  {error.fields.address.join(', ')}
                </span>
              </div>
            )}
          </div>
        </fieldset>

        {/* Contact Information Section */}
        <fieldset className='border-success/30 bg-success/20 space-y-4 rounded-lg border p-4'>
          <legend className='border-success/30 bg-base-100 text-success flex items-center gap-2 rounded-md border px-3 py-1 font-medium shadow-sm'>
            <IconPhone className='h-5 w-5' />
            <span>Informasi Kontak</span>
          </legend>

          {/* Nomor Telepon */}
          <div className='space-y-2'>
            <label
              className='label text-base-content font-medium'
              htmlFor='phoneNumber'
            >
              <span className='flex items-center gap-2'>
                <IconSmartphone className='text-success h-4 w-4' />
                Nomor Telepon
              </span>
            </label>
            <input
              id='phoneNumber'
              name='phoneNumber'
              className='input input-bordered border-success/30 bg-base-100 focus:border-success focus:ring-success/20 validator w-full transition-all duration-200 focus:ring-2'
              type='tel'
              defaultValue={currentTarget.phoneNumber || ''}
              disabled={isPending}
              placeholder='Contoh: 08123456789 (opsional)'
              pattern='08[0-9]{8,13}'
              title='Nomor telepon harus dimulai dengan 08 diikuti 8-13 digit angka'
            />
            {error && error.fields.phoneNumber && (
              <div className='label text-error text-sm'>
                <span className='flex items-center gap-1'>
                  <IconAlertTriangle className='h-3 w-3' />
                  {error.fields.phoneNumber.join(', ')}
                </span>
              </div>
            )}
          </div>
        </fieldset>

        {/* hidden mandatory fields */}
        {currentTarget.id && (
          <input type='hidden' name='id' value={currentTarget.id} />
        )}
        <input type='hidden' name='regionId' value={currentRegion.id} />

        {/* Action Buttons */}
        <div className='border-base-content/20 flex flex-col-reverse gap-3 border-t pt-4 md:flex-row-reverse md:gap-4'>
          <button
            className={`btn btn-primary min-h-12 flex-1 transition-all duration-200 md:flex-none md:px-8 ${
              isPending ? 'loading' : 'hover:scale-105 hover:shadow-lg'
            }`}
            type='submit'
            disabled={isPending || isDeleting}
          >
            {isPending ? (
              <>
                <IconLoader className='h-4 w-4 animate-spin' />
                Menyimpan...
              </>
            ) : (
              <>
                <IconSave className='h-4 w-4' />
                Simpan Data
              </>
            )}
          </button>

          {/* Delete button - only show for existing targets */}
          {currentTarget.id && (
            <button
              className={`btn btn-error min-h-12 flex-1 transition-all duration-200 md:flex-none md:px-6 ${
                isDeleting ? 'loading' : 'hover:scale-105 hover:shadow-lg'
              }`}
              type='button'
              onClick={handleDelete}
              disabled={isPending || isDeleting}
            >
              {isDeleting ? (
                <>
                  <IconLoader className='h-4 w-4 animate-spin' />
                  Menghapus...
                </>
              ) : (
                <>
                  <IconTrash className='h-4 w-4' />
                  Hapus
                </>
              )}
            </button>
          )}

          <button
            className='btn btn-ghost hover:bg-base-content/10 min-h-12 flex-1 transition-all duration-200 md:flex-none md:px-6'
            type='button'
            onClick={() => setCurrentTarget(undefined)}
            disabled={isPending || isDeleting}
          >
            <IconX className='h-4 w-4' />
            Batal
          </button>
        </div>
      </form>
    </DialogComponent>
  )
}

export default TargetDialog

export const LocationMarker: FC<{
  initialLatLng?: L.LatLng | undefined
  currentLatLng: L.LatLng
  setLatLng: Dispatch<SetStateAction<L.LatLng>>
  setAddress: Dispatch<SetStateAction<string>>
  getAddressFromCoords: (lat: number, lng: number) => Promise<string>
}> = ({
  initialLatLng = undefined,
  currentLatLng,
  setLatLng,
  setAddress,
  getAddressFromCoords
}) => {
  const [position, setPosition] = useState<L.LatLng | undefined>(initialLatLng)

  const map = useMapEvents({
    click: async (e) => {
      setPosition(e.latlng)
      setLatLng(e.latlng)

      // Get address from coordinates when user clicks on map
      try {
        const addressFromCoords = await getAddressFromCoords(
          e.latlng.lat,
          e.latlng.lng
        )
        if (addressFromCoords) {
          setAddress(addressFromCoords)
        }
        // Note: Error handling is already done in getAddressFromCoords function
      } catch (error) {
        console.error('Error getting address from map click:', error)
        // Error toast is already shown in getAddressFromCoords
      }
    }
  })

  // Update position when currentLatLng changes (e.g., from location button)
  useEffect(() => {
    if (currentLatLng && (currentLatLng.lat !== 0 || currentLatLng.lng !== 0)) {
      const newPosition = currentLatLng
      setPosition(newPosition)

      // Center the map on the new position
      if (map) {
        map.setView(newPosition, 15) // Set zoom level to 15 for better detail
      }
    }
  }, [currentLatLng, map])

  // Initialize position from initialLatLng on component mount
  useEffect(() => {
    if (initialLatLng && !position) {
      setPosition(initialLatLng)
      if (map) {
        map.setView(initialLatLng, map.getZoom())
      }
    }
  }, [initialLatLng, position, map])

  if (!position) {
    return <></>
  }

  return <Marker position={position} />
}
