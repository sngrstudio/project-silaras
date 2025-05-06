import { seedSettings } from './settings'

const main = async () => {
  await seedSettings()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
