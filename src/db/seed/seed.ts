import seedALM from './access-level-map'

const main = async () => {
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
