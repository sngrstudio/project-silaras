import {
  useActionState,
  useState,
  type Dispatch,
  type FC,
  type SetStateAction
} from 'react'
import { DialogTemplate } from '~/components/common/dialog/dialog'
import { useStore } from '@nanostores/react'
import {
  $currentPatient,
  setCurrentPatient,
  $currentRegion,
  setPatients,
  $openPatientModal
} from './patient.store'
import { actions, isInputError } from 'astro:actions'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const PatientDialog: FC = () => {
  const currentRegion = useStore($currentRegion)
  const currentPatient = useStore($currentPatient)
  const openPatientModal = useStore($openPatientModal)
  const [latLng, setLatLng] = useState<L.LatLng>({
    lat: currentPatient?.latitude ?? 0,
    lng: currentPatient?.longitude ?? 0
  } as L.LatLng)

  const handleSubmit = async (_prev: unknown, formData: FormData) => {
    const { data, error } = await actions.patient.upsert(formData)
    if (error && !data) {
      if (isInputError(error)) {
        return error
      }

      console.log(error)
      return undefined
    }

    const updatedPatients = await actions.patient.getAll.orThrow({
      regionSlug: currentRegion?.slug ?? ''
    })
    setPatients(updatedPatients)
    setCurrentPatient(undefined)
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, action, isPending] = useActionState(handleSubmit, undefined)

  if (!currentPatient || !currentRegion) {
    return <></>
  }

  return (
    <DialogTemplate open={openPatientModal}>
      <form className='flex flex-col gap-2' action={action}>
        {/* Nama */}
        <div>
          <label className='label' htmlFor='name'>
            Nama Pasien
          </label>
          <input
            id='name'
            name='name'
            className='input w-full'
            type='text'
            defaultValue={currentPatient.name}
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
            defaultValue={currentPatient.motherName}
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
              typeof currentPatient.birthDate === 'string'
                ? (currentPatient.birthDate as string).slice(0, 10)
                : currentPatient.birthDate?.toISOString().slice(0, 10)
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
            defaultValue={currentPatient.status}
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
            defaultValue={currentPatient.initialWeight}
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
            defaultValue={currentPatient.initialHeight}
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
            center={[-2.537956, 112.940995]}
            zoom={15}
          >
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
            <LocationMarker setLatLng={setLatLng} />
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
            onClick={() => setCurrentPatient(undefined)}
          >
            Batal
          </button>
        </div>
      </form>
    </DialogTemplate>
  )
}

export default PatientDialog

export const LocationMarker: FC<{
  setLatLng: Dispatch<SetStateAction<L.LatLng>>
}> = ({ setLatLng }) => {
  const [position, setPosition] = useState<L.LatLng | undefined>(undefined)

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
