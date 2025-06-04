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
  const [latLng, setLatLng] = useState<L.LatLng>({
    lat: currentTarget?.latitude ?? 0,
    lng: currentTarget?.longitude ?? 0
  } as L.LatLng)
  const [address, setAddress] = useState<string>(currentTarget?.address || '')
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  useEffect(() => {
    document.addEventListener('astro:page-load', () => {
      setCurrentTarget(undefined)
    })
  })

  // Update address when current target changes
  useEffect(() => {
    if (currentTarget?.address) {
      setAddress(currentTarget.address)
    }
  }, [currentTarget?.address])

  // Update latLng when current target changes
  useEffect(() => {
    if (currentTarget) {
      setLatLng({
        lat: currentTarget.latitude ?? 0,
        lng: currentTarget.longitude ?? 0
      } as L.LatLng)
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, action, isPending] = useActionState(handleSubmit, undefined)

  if (!currentTarget || !currentRegion) {
    return <></>
  }

  return (
    <DialogComponent
      title='Tambah atau Ubah Sasaran'
      open={openTargetModal}
      onOpenChange={(open) => !open && setCurrentTarget(undefined)}
    >
      <form className='flex flex-col gap-6 p-1' action={action}>
        {/* Personal Information Section */}
        <fieldset className='space-y-4 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4'>
          <legend className='flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-1 font-medium text-blue-700 shadow-sm'>
            <IconUser className='h-5 w-5' />
            <span>Informasi Personal</span>
          </legend>

          {/* Nama */}
          <div className='space-y-2'>
            <label className='label font-medium text-gray-700' htmlFor='name'>
              <span className='flex items-center gap-2'>
                <IconEdit className='h-4 w-4 text-blue-600' />
                Nama Sasaran
              </span>
            </label>
            <input
              id='name'
              name='name'
              className='input input-bordered w-full border-blue-200 bg-white transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              type='text'
              defaultValue={currentTarget.name}
              disabled={isPending}
              required
              placeholder='Masukkan nama lengkap'
            />
            {error && error.fields.name && (
              <div className='label text-sm text-red-500'>
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
              className='label font-medium text-gray-700'
              htmlFor='motherName'
            >
              <span className='flex items-center gap-2'>
                <IconHeart className='h-4 w-4 text-pink-600' />
                Nama Ibu
              </span>
            </label>
            <input
              id='motherName'
              name='motherName'
              className='input input-bordered w-full border-blue-200 bg-white transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              type='text'
              defaultValue={currentTarget.motherName}
              disabled={isPending}
              required
              placeholder='Masukkan nama ibu'
            />
            {error && error.fields.motherName && (
              <div className='label text-sm text-red-500'>
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
              className='label font-medium text-gray-700'
              htmlFor='birthDate'
            >
              <span className='flex items-center gap-2'>
                <IconCake className='h-4 w-4 text-green-600' />
                Tanggal Lahir
              </span>
            </label>
            <input
              id='birthDate'
              name='birthDate'
              className='input input-bordered w-full border-blue-200 bg-white transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              type='date'
              defaultValue={
                typeof currentTarget.birthDate === 'string'
                  ? (currentTarget.birthDate as string).slice(0, 10)
                  : currentTarget.birthDate?.toISOString().slice(0, 10)
              }
              disabled={isPending}
              required
            />
            {error && error.fields.birthDate && (
              <div className='label text-sm text-red-500'>
                <span className='flex items-center gap-1'>
                  <IconAlertTriangle className='h-3 w-3' />
                  {error.fields.birthDate.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className='space-y-3'>
            <label className='label font-medium text-gray-700'>
              <span className='flex items-center gap-2'>
                <IconTag className='h-4 w-4 text-purple-600' />
                Status
              </span>
            </label>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              {/* Hamil Status Card */}
              <label className='cursor-pointer'>
                <input
                  type='radio'
                  name='status'
                  value='HAMIL'
                  defaultChecked={currentTarget.status === 'HAMIL'}
                  disabled={isPending}
                  required
                  className='sr-only'
                />
                <div className='card card-compact h-24 border-2 border-gray-200 bg-white transition-all duration-200 hover:scale-105 hover:border-pink-300 hover:shadow-sm has-[:checked]:border-pink-400 has-[:checked]:bg-pink-50 has-[:checked]:shadow-md'>
                  <div className='card-body items-center justify-center p-3 text-center'>
                    <IconUsers className='h-8 w-8 text-pink-600' />
                    <div className='flex flex-col items-center'>
                      <span className='font-medium text-gray-700'>Hamil</span>
                      <span className='text-xs text-transparent'>
                        placeholder
                      </span>
                    </div>
                  </div>
                </div>
              </label>

              {/* Menyusui Status Card */}
              <label className='cursor-pointer'>
                <input
                  type='radio'
                  name='status'
                  value='MENYUSUI'
                  defaultChecked={currentTarget.status === 'MENYUSUI'}
                  disabled={isPending}
                  required
                  className='sr-only'
                />
                <div className='card card-compact h-24 border-2 border-gray-200 bg-white transition-all duration-200 hover:scale-105 hover:border-blue-300 hover:shadow-sm has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50 has-[:checked]:shadow-md'>
                  <div className='card-body items-center justify-center p-3 text-center'>
                    <IconMilk className='h-8 w-8 text-blue-600' />
                    <div className='flex flex-col items-center'>
                      <span className='font-medium text-gray-700'>
                        Menyusui
                      </span>
                      <span className='text-xs text-transparent'>
                        placeholder
                      </span>
                    </div>
                  </div>
                </div>
              </label>

              {/* Baduta Status Card */}
              <label className='cursor-pointer'>
                <input
                  type='radio'
                  name='status'
                  value='ANAK-ANAK'
                  defaultChecked={currentTarget.status === 'ANAK-ANAK'}
                  disabled={isPending}
                  required
                  className='sr-only'
                />
                <div className='card card-compact h-24 border-2 border-gray-200 bg-white transition-all duration-200 hover:scale-105 hover:border-green-300 hover:shadow-sm has-[:checked]:border-green-400 has-[:checked]:bg-green-50 has-[:checked]:shadow-md'>
                  <div className='card-body items-center justify-center p-3 text-center'>
                    <IconBaby className='h-8 w-8 text-green-600' />
                    <div className='flex flex-col items-center'>
                      <span className='font-medium text-gray-700'>Baduta</span>
                      <span className='text-xs text-gray-500'>
                        Bawah Dua Tahun
                      </span>
                    </div>
                  </div>
                </div>
              </label>
            </div>
            {error && error.fields.status && (
              <div className='label text-sm text-red-500'>
                <span className='flex items-center gap-1'>
                  <IconAlertTriangle className='h-3 w-3' />
                  {error.fields.status.join(', ')}
                </span>
              </div>
            )}
          </div>
        </fieldset>

        {/* Health Metrics Section */}
        <fieldset className='space-y-4 rounded-lg border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-4'>
          <legend className='flex items-center gap-2 rounded-md border border-green-200 bg-white px-3 py-1 font-medium text-green-700 shadow-sm'>
            <IconActivity className='h-5 w-5' />
            <span>Data Kesehatan</span>
          </legend>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Initial Weight */}
            <div className='space-y-2'>
              <label
                className='label font-medium text-gray-700'
                htmlFor='initialWeight'
              >
                <span className='flex items-center gap-2'>
                  <IconWeight className='h-4 w-4 text-orange-600' />
                  Berat Badan Awal
                </span>
              </label>
              <div className='relative'>
                <input
                  id='initialWeight'
                  name='initialWeight'
                  className='input input-bordered w-full border-green-200 bg-white pr-12 transition-all duration-200 focus:border-green-400 focus:ring-2 focus:ring-green-100'
                  type='number'
                  step='0.01'
                  min='0'
                  defaultValue={currentTarget.initialWeight}
                  disabled={isPending}
                  required
                  placeholder='0.00'
                />
                <span className='absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500'>
                  kg
                </span>
              </div>
              {error && error.fields.initialWeight && (
                <div className='label text-sm text-red-500'>
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
                className='label font-medium text-gray-700'
                htmlFor='initialHeight'
              >
                <span className='flex items-center gap-2'>
                  <IconRuler className='h-4 w-4 text-blue-600' />
                  Tinggi Badan Awal
                </span>
              </label>
              <div className='relative'>
                <input
                  id='initialHeight'
                  name='initialHeight'
                  className='input input-bordered w-full border-green-200 bg-white pr-12 transition-all duration-200 focus:border-green-400 focus:ring-2 focus:ring-green-100'
                  type='number'
                  step='0.1'
                  min='0'
                  defaultValue={currentTarget.initialHeight}
                  disabled={isPending}
                  required
                  placeholder='0.0'
                />
                <span className='absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500'>
                  cm
                </span>
              </div>
              {error && error.fields.initialHeight && (
                <div className='label text-sm text-red-500'>
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
        <fieldset className='space-y-4 rounded-lg border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-4'>
          <div className='flex items-center justify-between'>
            <legend className='flex items-center gap-2 rounded-md border border-amber-200 bg-white px-3 py-1 font-medium text-amber-700 shadow-sm'>
              <IconMap className='h-5 w-5' />
              <span>Informasi Lokasi</span>
            </legend>
            <button
              type='button'
              className={`btn btn-sm transition-all duration-200 ${
                isGettingLocation
                  ? 'btn-disabled bg-amber-200 text-amber-600'
                  : 'btn-outline btn-warning hover:btn-warning hover:scale-105'
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
                ? 'border-amber-300 shadow-lg'
                : 'border-amber-200 hover:border-amber-300'
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
              zoom={15}
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
              <div className='absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
                <div className='flex flex-col items-center gap-3 text-amber-700'>
                  <IconLoader className='h-8 w-8 animate-spin' />
                  <span className='font-medium'>Mengambil lokasi Anda...</span>
                </div>
              </div>
            )}
          </div>

          <input type='hidden' name='latitude' value={latLng.lat} />
          <input type='hidden' name='longitude' value={latLng.lng} />
          {error && (error.fields.latitude || error.fields.longitude) && (
            <div className='label text-sm text-red-500'>
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
              className='label font-medium text-gray-700'
              htmlFor='address'
            >
              <span className='flex items-center gap-2'>
                <IconHome className='h-4 w-4 text-red-600' />
                Alamat
              </span>
            </label>
            <textarea
              id='address'
              name='address'
              className='textarea textarea-bordered min-h-[80px] w-full resize-none border-amber-200 bg-white transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isPending || isGettingLocation}
              placeholder='Alamat akan terisi otomatis saat menggunakan lokasi saat ini, atau masukkan secara manual'
              rows={3}
            />
            {error && error.fields.address && (
              <div className='label text-sm text-red-500'>
                <span className='flex items-center gap-1'>
                  <IconAlertTriangle className='h-3 w-3' />
                  {error.fields.address.join(', ')}
                </span>
              </div>
            )}
          </div>
        </fieldset>

        {/* Contact Information Section */}
        <fieldset className='space-y-4 rounded-lg border border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 p-4'>
          <legend className='flex items-center gap-2 rounded-md border border-violet-200 bg-white px-3 py-1 font-medium text-violet-700 shadow-sm'>
            <IconPhone className='h-5 w-5' />
            <span>Informasi Kontak</span>
          </legend>

          {/* Nomor Telepon */}
          <div className='space-y-2'>
            <label
              className='label font-medium text-gray-700'
              htmlFor='phoneNumber'
            >
              <span className='flex items-center gap-2'>
                <IconSmartphone className='h-4 w-4 text-green-600' />
                Nomor Telepon
              </span>
            </label>
            <input
              id='phoneNumber'
              name='phoneNumber'
              className='input input-bordered w-full border-violet-200 bg-white transition-all duration-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100'
              type='tel'
              defaultValue={currentTarget.phoneNumber || ''}
              disabled={isPending}
              placeholder='Contoh: 08123456789 (opsional)'
            />
            {error && error.fields.phoneNumber && (
              <div className='label text-sm text-red-500'>
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
        <div className='flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 md:flex-row-reverse md:gap-4'>
          <button
            className={`btn btn-primary min-h-12 flex-1 transition-all duration-200 md:flex-none md:px-8 ${
              isPending
                ? 'loading'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg'
            }`}
            type='submit'
            disabled={isPending}
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

          <button
            className='btn btn-ghost min-h-12 flex-1 transition-all duration-200 hover:bg-gray-100 md:flex-none md:px-6'
            type='button'
            onClick={() => setCurrentTarget(undefined)}
            disabled={isPending}
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
