import seedSettings from './settings'
import seedMenu from './menu'
import seedALM from './access-level-map'
import seedRegions from './region'
import seedPatientProperties from './patient'

const main = async () => {
  await seedSettings()
  await seedALM()
  await seedMenu()
  await seedRegions()
  await seedPatientProperties()
}

main()
  .then(() => {
    console.log('Seeding completed!')
    process.exit(0)
  })
  .catch(() => {
    process.exit(1)
  })
