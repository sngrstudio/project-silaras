import { atom, computed } from 'nanostores'
import { actions } from 'astro:actions'

export type Patients = Awaited<
  ReturnType<typeof actions.patient.getAll.orThrow>
>

export const $patients = atom<Patients | undefined>(undefined)
export const setPatients = (state: Patients | undefined) => $patients.set(state)

export type Patient = Omit<Patients[number], 'slug' | 'age' | 'initialBMI'>

export const $currentPatient = atom<Patient | undefined>(undefined)
export const setCurrentPatient = (state: Patient | undefined) =>
  $currentPatient.set(state)

export const $openPatientModal = computed(
  $currentPatient,
  (current) => !!current
)

export type CurrentRegion = NonNullable<
  Awaited<ReturnType<typeof actions.region.getBySlug.orThrow>>
>

export const $currentRegion = atom<CurrentRegion | undefined>(undefined)
export const setCurrentRegion = (state: CurrentRegion | undefined) =>
  $currentRegion.set(state)
