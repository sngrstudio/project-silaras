import { seedSettings } from './settings'
import { seedRegions } from './region'

const main = async () => {
  await seedSettings().then(() =>
    console.log('Seeding Settings table complete!')
  )

  await seedRegions().then(() => console.log('Seeding Region table complete!'))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
