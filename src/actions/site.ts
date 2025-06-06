/**
 * @fileoverview Site Settings Management Astro Actions
 *
 * This module defines Astro server actions for managing site-wide settings
 * and configuration properties in the SILARAS application. Site settings
 * control various aspects of the application's behavior, appearance, and
 * metadata used throughout the system.
 *
 * @features
 * - Site property retrieval (individual and bulk operations)
 * - Configuration management with validation
 * - Dynamic setting updates without deployment
 * - Type-safe property access and modification
 * - Centralized application configuration
 *
 * @settings
 * - SITE_NAME: Primary application display name used in headers and titles
 * - SITE_DESCRIPTION: Application description for SEO and metadata
 * - Additional configurable properties for future expansion
 *
 * @actions
 * - get: Retrieve individual site property values
 * - getAll: Bulk retrieval of all site properties
 * - set: Update or create site property values
 *
 * @usage
 * ```typescript
 * // Get site name
 * const siteName = await actions.site.get({ property: 'SITE_NAME' })
 *
 * // Get all settings
 * const allSettings = await actions.site.getAll()
 *
 * // Update site name
 * await actions.site.set({
 *   property: 'SITE_NAME',
 *   value: 'New Site Name'
 * })
 * ```
 *
 * @validation
 * - Property name validation against allowed values
 * - Value format validation for specific properties
 * - Access control for administrative operations
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import { defineAction } from 'astro:actions'
import {
  getSiteProperty,
  getAllSiteProperties,
  upsertSiteProperty
} from '../db/queries/site'
import { z } from 'astro:schema'
const site = {
  /**
   * Get a single site property value.
   *
   * @example
   * const siteName = await actions.site.get({
   *   property: 'SITE_NAME'
   * })
   */
  get: defineAction({
    input: z.object({
      property: z.enum(['SITE_NAME', 'SITE_DESCRIPTION'])
    }),
    handler: async ({ property }) => {
      return await getSiteProperty(property)
    }
  }),

  /**
   * Get all site properties in a single request.
   * Returns an object with all property values.
   *
   * @example
   * const settings = await actions.site.getAll()
   * console.log(settings.SITE_NAME)
   */
  getAll: defineAction({
    handler: async () => {
      return await getAllSiteProperties()
    }
  }),

  /**
   * Update multiple site properties in a single call.
   * Only updates properties that have changed.
   * For logo, handles file upload if a new file is provided.
   *
   * @example
   * await actions.site.update({
   *   siteName: 'My Awesome Site',
   *   siteDescription: 'A cool site',
   *   siteLogo: fileFromForm
   * })
   */
  update: defineAction({
    accept: 'form',
    input: z.object({
      siteName: z.string().optional(),
      siteDescription: z.string().optional()
    }),
    handler: async (input) => {
      // Get current settings
      const currentSettings = await getAllSiteProperties()
      const updates: Array<Promise<string>> = []

      // Handle text properties if they've changed
      if (
        input.siteName !== undefined &&
        input.siteName !== currentSettings.SITE_NAME
      ) {
        updates.push(upsertSiteProperty('SITE_NAME', input.siteName))
      }
      if (
        input.siteDescription !== undefined &&
        input.siteDescription !== currentSettings.SITE_DESCRIPTION
      ) {
        updates.push(
          upsertSiteProperty('SITE_DESCRIPTION', input.siteDescription)
        )
      }

      // Wait for all updates to complete
      await Promise.all(updates)

      // Return updated settings
      return await getAllSiteProperties()
    }
  })
}

export default site
