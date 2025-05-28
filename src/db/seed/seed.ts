import { upsertRegion, getRegionBySlug } from '../queries/region'
import {
  upsertMonthlyAssesment,
  upsertDailyAssesment
} from '../queries/assesment'
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

  // --- Monthly and Daily Assessment Seeder ---
  // Only generate for June to October, using correct enum and types
  // Use upsertMonthlyAssesment and upsertDailyAssesment from queries
  type MonthEnum = 'JUNE' | 'JULY' | 'AUGUST' | 'SEPTEMBER' | 'OCTOBER'
  const months: { name: MonthEnum; days: number }[] = [
    { name: 'JUNE', days: 30 },
    { name: 'JULY', days: 31 },
    { name: 'AUGUST', days: 31 },
    { name: 'SEPTEMBER', days: 30 },
    { name: 'OCTOBER', days: 31 }
  ]

  // Only push defined rows
  const monthlyAssesmentRows: Array<{ id: string; month: MonthEnum }> = []
  for (const m of months) {
    const row = await upsertMonthlyAssesment(m.name)
    if (row && row.id)
      monthlyAssesmentRows.push(row as { id: string; month: MonthEnum })
  }

  for (let i = 0; i < months.length; i++) {
    const month = months[i]
    const monthlyRow = monthlyAssesmentRows[i]
    if (!month || !monthlyRow || !monthlyRow.id) continue
    for (let day = 1; day <= month.days; day++) {
      if (day === 31 && month.days < 31) continue // skip 31st if not in month
      const dateObj = new Date(Date.UTC(2025, 5 + i, day)) // June is month 5 (0-based)
      await upsertDailyAssesment({
        monthlyAssesmentId: monthlyRow.id,
        date: dateObj,
        menu1: '<<menu>>',
        menu2: '<<menu>>'
      })
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
