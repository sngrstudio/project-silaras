/**
 * @fileoverview Site Settings Database Query Functions
 *
 * This module provides database query functions for managing site-wide settings
 * and configuration properties in the SILARAS application. Site settings are
 * stored as key-value pairs and control various aspects of the application's
 * behavior and appearance.
 *
 * @features
 * - Site property retrieval (individual and bulk)
 * - Configuration management (SITE_NAME, SITE_DESCRIPTION, etc.)
 * - Key-value pair storage and retrieval
 * - Application-wide settings control
 * - Dynamic configuration updates
 *
 * @settings
 * - SITE_NAME: Application display name
 * - SITE_DESCRIPTION: Application description for metadata
 * - Additional configurable properties as needed
 *
 * @database MySQL via Drizzle ORM
 * @schema site table with property-value pairs
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import { db } from '../db'
import { site } from '../schemas/site'
import { eq } from 'drizzle-orm'

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
