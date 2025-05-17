import { db } from '../db'
import { patientDescriptionTable, patientStatusTable } from '../schema/patient'
import patientProperties from './data/patient-properties.json' assert { type: 'json' }

const seedPatientProperties = async () => {
  await db.insert(patientDescriptionTable).values(
    patientProperties.PATIENT_DESCRIPTION.map((description) => ({
      description
    }))
  )
  await db
    .insert(patientStatusTable)
    .values(
      patientProperties.PATIENT_STATUS.map((description) => ({ description }))
    )
  console.log('Seeding settings completed!')
}

export default seedPatientProperties
