import { db } from '../db'
import { regionOnWatchView } from '../schema/region'
import { eq } from 'drizzle-orm'

type Region = typeof regionOnWatchView.$inferSelect
type GetRegionsOptions = {
  page?: number | undefined
  size?: number | undefined
}
type RegionType = NonNullable<Region['regionType']>
type RegionSlug = NonNullable<Region['regionSlug']>

export const getRegions = async (
  type: RegionType,
  { page = 1, size = 10 }: GetRegionsOptions
) => {
  const getRegionsSQL = db
    .select({
      name: regionOnWatchView.regionName,
      slug: regionOnWatchView.regionSlug,
      type: regionOnWatchView.regionType,
      handler: regionOnWatchView.handler,
      phoneNumber: regionOnWatchView.phone
    })
    .from(regionOnWatchView)
    .where(eq(regionOnWatchView.regionType, type))
    .limit(size)
    .offset((page - 1) * size)
    .prepare()

  return await getRegionsSQL.execute()
}

export const getSpecificRegion = async (slug: RegionSlug) => {
  const getSpecificRegionSQL = db
    .select({
      name: regionOnWatchView.regionName,
      slug: regionOnWatchView.regionSlug,
      type: regionOnWatchView.regionType,
      handler: regionOnWatchView.handler,
      phoneNumber: regionOnWatchView.phone
    })
    .from(regionOnWatchView)
    .where(eq(regionOnWatchView.regionSlug, slug))
    .limit(1)
    .prepare()

  const [result] = await getSpecificRegionSQL.execute()
  return result
}

// export const updateSettings = async ({
//   name,
//   description,
//   logo
// }: {
//   name?: string | undefined
//   description?: string | undefined
//   logo?: string | undefined
// }) => {
//   await db.transaction(async (tx) => {
//     await tx
//       .update(settingsTable)
//       .set({
//         property: 'SITE_NAME',
//         value: name
//       })
//       .where(eq(settingsTable.property, 'SITE_NAME'))

//     await tx
//       .update(settingsTable)
//       .set({
//         property: 'SITE_DESCRIPTION',
//         value: description
//       })
//       .where(eq(settingsTable.property, 'SITE_DESCRIPTION'))

//     await tx
//       .update(settingsTable)
//       .set({
//         property: 'SITE_LOGO',
//         value: logo
//       })
//       .where(eq(settingsTable.property, 'SITE_LOGO'))
//   })

//   return await getSettings()
// }
