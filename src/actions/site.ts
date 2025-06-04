import { defineAction } from 'astro:actions'
import {
  getSiteProperty,
  getAllSiteProperties,
  upsertSiteProperty
} from '../db/queries/site'
import { z } from 'astro:schema'

/**
 * Astro Actions for Site Settings
 * Provides actions for managing site-wide configuration values.
 */
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
  }),

  cloudName: defineAction({
    handler: (_, ctx) => {
      return ctx.locals.cloudName
    }
  })
}

export default site
