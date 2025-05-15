import { db } from '../db'
import seedSettings from './settings'
import seedMenu from './menu'
import seedALM from './access-level-map'
import { seedRegions } from './region'

const main = async () => {
  await db.transaction(async () => {
    await seedSettings()
    await seedALM()
    await seedMenu()
    await seedRegions()
  })
}

main()
  .then(() => {
    console.log('Seeding completed!')
    process.exit(0)
  })
  .catch(() => {
    process.exit(1)
  })
