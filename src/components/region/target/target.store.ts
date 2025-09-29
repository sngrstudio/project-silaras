import { atom, computed } from 'nanostores'
import { actions } from 'astro:actions'

/**
 * @fileoverview Target Store
 *
 * Manages state for target (patient) data and target management modal
 * within the SILARAS system. This store handles the list of targets
 * in a region, the currently selected target for editing, and modal visibility.
 *
 * Features:
 * - Target listing with regional filtering
 * - Current target selection for CRUD operations
 * - Modal state management for target dialogs
 * - Current region context for proper data filtering
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

/**
 * Type definition for targets data
 * Retrieved from the target.getAll action, contains array of targets in a region
 */
export type Targets = Awaited<
  ReturnType<typeof actions.target.getAll.orThrow>
>['data']

/**
 * Type definition for pagination metadata
 */
export type PaginationMeta = {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Type definition for paginated targets response
 */
export type PaginatedTargets = {
  data: Targets
  meta: PaginationMeta
}

/**
 * Nanostore for targets data
 * Contains the list of targets (patients) for the currently selected region
 *
 * @default undefined - No targets loaded initially
 */
export const $targets = atom<Targets | undefined>(undefined)

/**
 * Nanostore for pagination metadata
 * Contains pagination information for the targets list
 *
 * @default undefined - No pagination data initially
 */
export const $targetsPagination = atom<PaginationMeta | undefined>(undefined)

/**
 * Nanostore for current page number
 * Tracks the current page being displayed
 *
 * @default 1 - Start with first page
 */
export const $currentPage = atom<number>(1)

/**
 * Setter function for targets state
 * Used to update the store with new targets data from API calls
 *
 * @param state - New targets array to set, or undefined to clear
 */
export const setTargets = (state: Targets | undefined) => $targets.set(state)

/**
 * Setter function for pagination metadata
 * Used to update pagination information
 *
 * @param meta - Pagination metadata to set, or undefined to clear
 */
export const setTargetsPagination = (meta: PaginationMeta | undefined) =>
  $targetsPagination.set(meta)

/**
 * Setter function for current page
 * Used to update the current page number
 *
 * @param page - Page number to set
 */
export const setCurrentPage = (page: number) => $currentPage.set(page)

/**
 * Type definition for individual target data
 * Omits computed fields like 'slug', 'age', and 'initialBMI' that are derived
 * from other target properties
 */
export type Target = Omit<Targets[number], 'slug' | 'age' | 'initialBMI'>

/**
 * Nanostore for currently selected target
 * Holds the target data when editing or viewing target details
 *
 * @default undefined - No target selected initially
 */
export const $currentTarget = atom<Target | undefined>(undefined)

/**
 * Setter function for current target state
 * Used to select a target for editing or clear the selection
 *
 * @param state - Target data to select, or undefined to clear selection
 */
export const setCurrentTarget = (state: Target | undefined) =>
  $currentTarget.set(state)

/**
 * Computed store for target modal visibility
 * Automatically determines if the target dialog should be open
 * based on whether a target is currently selected
 *
 * @returns true if a target is selected (modal should be open), false otherwise
 */
export const $openTargetModal = computed($currentTarget, (current) => !!current)

/**
 * Type definition for current region data
 * Non-nullable version of the region data from region.getBySlug action
 */
export type CurrentRegion = NonNullable<
  Awaited<ReturnType<typeof actions.region.getBySlug.orThrow>>
>

/**
 * Nanostore for current region context
 * Maintains the currently selected region for target filtering and context
 *
 * This is used to:
 * - Filter targets by region
 * - Provide regional context for access control
 * - Display region-specific information in the UI
 *
 * @default undefined - No region selected initially
 */
export const $currentRegion = atom<CurrentRegion | undefined>(undefined)

/**
 * Setter function for current region state
 * Used to set the regional context when navigating to target management
 *
 * @param state - Region data to set as current context, or undefined to clear
 */
export const setCurrentRegion = (state: CurrentRegion | undefined) =>
  $currentRegion.set(state)
