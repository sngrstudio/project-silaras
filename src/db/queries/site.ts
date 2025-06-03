import { db } from '../db'
import { site } from '../schemas/site'
import { eq } from 'drizzle-orm'

/**
 * Site settings table query functions.
 */

/**
 * Get a site property value.
 *
 * @param property The site property to get (SITE_NAME or SITE_DESCRIPTION)
 * @returns The value of the property or undefined if not found
 */
export const getSiteProperty = async (
  property: (typeof site.$inferSelect)['property']
) => {
  const result = await db
    .select({ value: site.value })
    .from(site)
    .where(eq(site.property, property))
    .limit(1)
    .then((rows) => rows[0])

  return result?.value
}

/**
 * Get all site properties.
 *
 * @returns Object containing all site properties
 */
export const getAllSiteProperties = async () => {
  const results = await db.select().from(site)

  return results.reduce(
    (acc, { property, value }) => ({
      ...acc,
      [property]: value
    }),
    {} as Record<(typeof site.$inferSelect)['property'], string>
  )
}

/**
 * Update or insert a site property.
 *
 * @param property The site property to set (SITE_NAME or SITE_DESCRIPTION)
 * @param value The new value for the property
 * @returns The updated site property value
 */
export const upsertSiteProperty = async (
  property: (typeof site.$inferSelect)['property'],
  value: string
) => {
  await db.insert(site).values({ property, value }).onDuplicateKeyUpdate({
    set: { value }
  })

  return value
}
