import { atom } from 'nanostores'
import { actions } from 'astro:actions'

/**
 * @fileoverview Region Store
 *
 * Manages state for regional data and navigation within the SILARAS system.
 * This store handles the hierarchical region structure including kabupaten,
 * kecamatan, and desa levels with their associated user counts and metadata.
 *
 * Features:
 * - Hierarchical region data with parent-child relationships
 * - User count tracking per region for management oversight
 * - Regional access control integration
 * - Region-based data filtering and navigation
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

/**
 * Type definition for regions data with counts
 * Retrieved from the region.getAllWithCounts action
 * Contains hierarchical region structure with user and target counts
 */
export type Regions = Awaited<
  ReturnType<typeof actions.region.getAllWithCounts.orThrow>
>

/**
 * Nanostore for regions data with user and target counts
 * Contains the hierarchical list of regions with associated metadata
 *
 * Each region entry includes:
 * - Basic region info (id, name, slug, type, parentId)
 * - userCount: Number of users assigned to this region
 * - targetCount: Number of targets (patients) in this region
 * - managedByUsers: Information about users managing this region
 * - Regional hierarchy relationships
 *
 * @default undefined - No regions loaded initially
 */
export const $regions = atom<Regions | undefined>(undefined)

/**
 * Setter function for regions state
 * Used to update the store with new regions data from API calls
 *
 * This is typically called when:
 * - Initially loading the region management interface
 * - Refreshing data after region modifications
 * - Switching between different regional views
 *
 * @param state - New regions data with counts, or undefined to clear
 */
export const setRegions = (state: Regions | undefined) => $regions.set(state)
