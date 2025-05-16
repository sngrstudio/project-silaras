import { db } from '../db'
import { regionTable, regionOnWatchTable } from '../schema/region'
import { type InferInsertModel } from 'drizzle-orm'
import regions from './data/regions.json' assert { type: 'json' }
import { eq } from 'drizzle-orm'

type InsertRegion = InferInsertModel<typeof regionTable>

export const seedRegions = async () => {
  await db.transaction(async (tx) => {
    const districtsData = regions
      .filter((reg) => reg.type === 'DISTRICT')
      .map(({ name, code, slug }) => {
        const region: InsertRegion = {
          type: 'DISTRICT',
          name,
          code,
          slug
        }

        return region
      })

    await tx.insert(regionTable).values(districtsData)

    const districts = await tx
      .select({ id: regionTable.id, code: regionTable.code })
      .from(regionTable)
      .where(eq(regionTable.type, 'DISTRICT'))
    await Promise.all(
      districts.map(async (district) => {
        const subdistrictsData = regions
          .filter(
            (reg) =>
              reg.type === 'SUBDISTRICT' && reg.parentCode === district.code
          )
          .map(({ name, code, slug }) => {
            const region: InsertRegion = {
              type: 'SUBDISTRICT',
              parentId: district.id,
              name,
              code,
              slug
            }

            return region
          })

        const result = await tx
          .insert(regionTable)
          .values(subdistrictsData)
          .$returningId()
        await tx
          .insert(regionOnWatchTable)
          .values(result.map((r) => ({ regionId: r.id })))
      })
    )

    const subdistricts = await tx
      .select({ id: regionTable.id, code: regionTable.code })
      .from(regionTable)
      .where(eq(regionTable.type, 'SUBDISTRICT'))
    await Promise.all(
      subdistricts.map(async (subdistrict) => {
        const villagesData = regions
          .filter(
            (reg) =>
              reg.type === 'VILLAGE' && reg.parentCode === subdistrict.code
          )
          .map(({ name, code, slug }) => {
            const region: InsertRegion = {
              type: 'VILLAGE',
              parentId: subdistrict.id,
              name,
              code,
              slug
            }

            return region
          })

        const result = await tx
          .insert(regionTable)
          .values(villagesData)
          .$returningId()
        await tx
          .insert(regionOnWatchTable)
          .values(result.map((r) => ({ regionId: r.id })))
      })
    )
  })

  console.log('Seeding regions completed!')
}
