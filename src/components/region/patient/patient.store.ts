import { atom } from 'nanostores'
import { actions } from 'astro:actions'

export type Patients = Awaited<
  ReturnType<typeof actions.patient.getAll.orThrow>
>

export const $patients = atom<Patients | undefined>(undefined)
export const setPatients = (state: Patients | undefined) => $patients.set(state)
