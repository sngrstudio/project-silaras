import { atom } from 'nanostores'
import { actions } from 'astro:actions'

/**
 * @fileoverview Site Settings Store
 *
 * Manages state for global site configuration within the SILARAS system.
 * This store handles site-wide settings that affect the entire application's
 * behavior, appearance, and functionality.
 *
 * Features:
 * - Global site configuration management
 * - Site metadata and branding settings
 * - Application-wide behavioral settings
 * - Administrative configuration interface state
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

/**
 * Type definition for site settings data
 * Retrieved from the site.getAll action
 * Contains global configuration settings for the application
 */
export type SiteSettings = Awaited<
  ReturnType<typeof actions.site.getAll.orThrow>
>

/**
 * Nanostore for site settings configuration
 * Contains global settings that affect the entire application
 *
 * Typical settings include:
 * - Site name and branding information
 * - Default configuration values
 * - Feature flags and toggles
 * - System-wide behavioral settings
 * - Contact information and metadata
 *
 * @default undefined - No site settings loaded initially
 */
export const $siteSettings = atom<SiteSettings | undefined>(undefined)

/**
 * Setter function for site settings state
 * Used to update the store with new site configuration from API calls
 *
 * This is typically called when:
 * - Loading the site settings management interface
 * - Applying new site configuration changes
 * - Refreshing settings after administrative updates
 *
 * @param state - New site settings data, or undefined to clear
 */
export const setSiteSettings = (state: SiteSettings | undefined) =>
  $siteSettings.set(state)
