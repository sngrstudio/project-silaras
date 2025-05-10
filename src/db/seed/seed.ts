import seedSettings from './settings'
import seedMenu from './menu'
import seedALM from './access-level-map'

const main = async () => {
  await seedSettings()
  await seedMenu()
  await seedALM()
}

main()
  .then(() => {
    console.log('Seeding completed!')
    process.exit(0)
  })
  .catch(() => {
    process.exit(1)
  })
