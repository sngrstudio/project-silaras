import { db } from '../db'
import { accessLevelMapTable } from '../schema/user'

const ALM_VALUES = ['Viewer', 'User', 'Coordinator', 'Administrator'].map(
  (description) => ({
    description
  })
)

const seedALM = async () => {
  await db.insert(accessLevelMapTable).values(ALM_VALUES)
  console.log('Seeding access levels completed!')
}

export default seedALM
