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

const TargetDialog: FC = () => {
  const currentRegion = useStore($currentRegion)
  const currentTarget = useStore($currentTarget)
  const openTargetModal = useStore($openTargetModal)
  const [latLng, setLatLng] = useState<L.LatLng>({
    lat: currentTarget?.latitude ?? 0,
    lng: currentTarget?.longitude ?? 0
  } as L.LatLng)

  useEffect(() => {
    document.addEventListener('astro:page-load', () => {
      setCurrentTarget(undefined)
    })
  })

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
      <form className='flex flex-col gap-2' action={action}>
        {/* Nama */}
        <div>
          <label className='label' htmlFor='name'>
            Nama Sasaran
          </label>
          <input
            id='name'
            name='name'
            className='input w-full'
            type='text'
            defaultValue={currentTarget.name}
            disabled={isPending}
            required
          />
          {error && error.fields.name && (
            <div className='label'>{error.fields.name.join(', ')}</div>
          )}
        </div>

        {/* Nama Ibu */}
        <div>
          <label className='label' htmlFor='motherName'>
            Nama Ibu
          </label>
          <input
            id='motherName'
            name='motherName'
            className='input w-full'
            type='text'
            defaultValue={currentTarget.motherName}
            disabled={isPending}
            required
          />
          {error && error.fields.motherName && (
            <div className='label'>{error.fields.motherName.join(', ')}</div>
          )}
        </div>

        {/* Tanggal Lahir */}
        <div>
          <label className='label' htmlFor='birthDate'>
            Tanggal Lahir
          </label>
          <input
            id='birthDate'
            name='birthDate'
            className='input w-full'
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
            <div className='label'>{error.fields.birthDate.join(', ')}</div>
          )}
        </div>

        {/* Status */}
        <div>
          <label className='label' htmlFor='status'>
            Status
          </label>
          <select
            className='select w-full'
            name='status'
            id='status'
            defaultValue={currentTarget.status}
            disabled={isPending}
            required
          >
            {['HAMIL', 'MENYUSUI', 'ANAK-ANAK'].map((option, i) => (
              <option value={option} key={i}>
                {option}
              </option>
            ))}
          </select>
          {error && error.fields.status && (
            <div className='label'>{error.fields.status.join(', ')}</div>
          )}
        </div>

        {/* Initial Weight */}
        <div>
          <label className='label' htmlFor='initialWeight'>
            Berat Badan Awal (kg)
          </label>
          <input
            id='initialWeight'
            name='initialWeight'
            className='input w-full'
            type='number'
            step='0.01'
            min='0'
            defaultValue={currentTarget.initialWeight}
            disabled={isPending}
            required
          />
          {error && error.fields.initialWeight && (
            <div className='label'>{error.fields.initialWeight.join(', ')}</div>
          )}
        </div>

        {/* Initial Height */}
        <div>
          <label className='label' htmlFor='initialHeight'>
            Tinggi Badan Awal (cm)
          </label>
          <input
            id='initialHeight'
            name='initialHeight'
            className='input w-full'
            type='number'
            step='0.1'
            min='0'
            defaultValue={currentTarget.initialHeight}
            disabled={isPending}
            required
          />
          {error && error.fields.initialHeight && (
            <div className='label'>{error.fields.initialHeight.join(', ')}</div>
          )}
        </div>

        {/* Lokasi */}
        <div>
          <label className='label' htmlFor='latitude'>
            Lokasi
          </label>
          <MapContainer
            className='aspect-[4/3] w-full'
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
          <input type='hidden' name='latitude' value={latLng.lat} />
          <input type='hidden' name='longitude' value={latLng.lng} />
          {error && (error.fields.latitude || error.fields.longitude) && (
            <div className='label'>
              {[
                ...(error.fields.latitude ?? []),
                ...(error.fields.longitude ?? [])
              ].join(', ')}
            </div>
          )}
        </div>

        {/* Alamat */}
        <div>
          <label className='label' htmlFor='address'>
            Alamat (opsional)
          </label>
          <input
            id='address'
            name='address'
            className='input w-full'
            type='text'
            defaultValue={currentTarget.address || ''}
            disabled={isPending}
          />
          {error && error.fields.address && (
            <div className='label'>{error.fields.address.join(', ')}</div>
          )}
        </div>

        {/* Nomor Telepon */}
        <div>
          <label className='label' htmlFor='phoneNumber'>
            Nomor Telepon (opsional)
          </label>
          <input
            id='phoneNumber'
            name='phoneNumber'
            className='input w-full'
            type='tel'
            defaultValue={currentTarget.phoneNumber || ''}
            disabled={isPending}
          />
          {error && error.fields.phoneNumber && (
            <div className='label'>{error.fields.phoneNumber.join(', ')}</div>
          )}
        </div>

        {/* hidden mandatory fields */}
        {currentTarget.id && (
          <input type='hidden' name='id' value={currentTarget.id} />
        )}
        <input type='hidden' name='regionId' value={currentRegion.id} />

        <div className='mt-4 flex w-full flex-col-reverse max-md:*:w-full md:flex-row-reverse'>
          <button
            className='btn btn-primary'
            type='submit'
            disabled={isPending}
          >
            Simpan
          </button>

          <button
            className='btn btn-link'
            onClick={() => setCurrentTarget(undefined)}
          >
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
  setLatLng: Dispatch<SetStateAction<L.LatLng>>
}> = ({ initialLatLng = undefined, setLatLng }) => {
  const [position, setPosition] = useState<L.LatLng | undefined>(initialLatLng)

  useMapEvents({
    click: (e) => {
      setPosition(e.latlng)
      setLatLng(e.latlng)
    }
  })

  if (!position) {
    return <></>
  }

  return <Marker position={position} />
}
