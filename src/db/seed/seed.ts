import { db } from '../index'
import { regionTable, kbVillageTable } from '../schema/region'
import { patientConditionsLookupTable } from '../schema/patient'
import { assesmentMenuLookupTable } from '../schema/assesment'
import regionsData from './regions.json' assert { type: 'json' }
import patientConditionsData from './patient-conditions.json' assert { type: 'json' }
import assesmentMenuData from './assesment-menu.json' assert { type: 'json' }

const main = async () => {
  await db.transaction(async (tx) => {
    // Regions
    await Promise.all(
      regionsData.map(async (reg) => {
        const regId = await tx
          .insert(regionTable)
          .values({ name: reg.name })
          .$returningId()
        await Promise.all(
          reg.children.map(async (dist) => {
            const distId = await tx
              .insert(regionTable)
              .values({ name: dist.name, parentRegionId: regId[0]?.id })
              .$returningId()
            await Promise.all(
              dist.children.map(async (sub) => {
                const subId = await tx
                  .insert(regionTable)
                  .values({ name: sub.name, parentRegionId: distId[0]?.id })
                  .$returningId()
                await tx.insert(kbVillageTable).values({ id: subId[0]?.id })
              })
            )
          })
        )
      })
    )

    // Lookup tables
    await tx.insert(patientConditionsLookupTable).values(patientConditionsData)
    await tx.insert(assesmentMenuLookupTable).values(assesmentMenuData)
  })
}

main()
  .then(() => {
    console.log('Database seeded successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
