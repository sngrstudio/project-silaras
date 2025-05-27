import { upsertRegion, getRegionBySlug } from '../queries/region'
import regionsData from './data/regions.json'

async function seed() {
  // Map to store slug to region id
  const slugToId = new Map<string, string>()

  // Insert regions in order: KABUPATEN, KECAMATAN, DESA
  for (const type of ['KABUPATEN', 'KECAMATAN', 'DESA'] as const) {
    const regionsOfType = regionsData.filter((r) => r.type === type)
    // Prepare regions with parentId resolved
    const regionsToInsert = []
    for (const region of regionsOfType) {
      let parentId: string | undefined = undefined
      if (region.parentSlug) {
        const parentRegion = await getRegionBySlug(region.parentSlug)
        if (!parentRegion) {
          throw new Error(
            `Parent region with slug '${region.parentSlug}' not found for region '${region.slug}'`
          )
        }
        parentId = parentRegion.id
      }
      regionsToInsert.push({
        name: region.name,
        slug: region.slug,
        type: region.type as 'KABUPATEN' | 'KECAMATAN' | 'DESA',
        parentId: parentId ?? null
      })
    }
    // Insert all regions of this type in parallel (one by one, but concurrently)
    const dbRegions = await Promise.all(regionsToInsert.map(upsertRegion))
    for (const dbRegion of dbRegions) {
      if (dbRegion && dbRegion.id && dbRegion.slug) {
        slugToId.set(dbRegion.slug, dbRegion.id)
      }
    }
  }

  console.log('Seed completed!')
}

seed()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
