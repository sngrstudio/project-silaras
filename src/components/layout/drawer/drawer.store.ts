import { atom } from 'nanostores'
import { actions } from 'astro:actions'

/**
 * @fileoverview Drawer Store
 *
 * Manages the navigation drawer (sidebar) state and current user session data
 * for the SILARAS application. This store handles the open/closed state of the
 * sidebar navigation and maintains the currently authenticated user's information.
 *
 * The store coordinates between:
 * - Sidebar visibility for responsive navigation
 * - User session data for authentication and authorization
 * - Hydration-safe user data management
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

/**
 * Nanostore for drawer open/closed state
 * Controls the visibility of the navigation sidebar
 *
 * @default false - Drawer is closed by default
 */
export const $openDrawer = atom<boolean>(false)

/**
 * Setter function for drawer state
 * Used to toggle the sidebar navigation open/closed
 *
 * @param state - Boolean indicating whether drawer should be open (true) or closed (false)
 */
export const setOpenDrawer = (state: boolean) => $openDrawer.set(state)

/**
 * Type definition for current user data
 * Retrieved from the user.getCurrent action
 * Contains user session information, permissions, and profile data
 */
type CurrentUser = Awaited<ReturnType<typeof actions.user.getCurrent.orThrow>>

/**
 * Nanostore for current authenticated user data
 * Maintains user session information across the application
 *
 * Contains user profile data including:
 * - Authentication status and session info
 * - Access level and regional permissions
 * - Profile information (name, phone, etc.)
 * - Region assignment for territorial access control
 *
 * @default undefined - No user logged in initially
 */
export const $currentUser = atom<CurrentUser | undefined>(undefined)

/**
 * Setter function for current user state
 * Used to update user session data during login/logout or profile updates
 *
 * Important: This function is hydration-safe and should be called
 * during component mounting to prevent SSR/client mismatches
 *
 * @param state - User session data to set, or undefined to clear (logout)
 */
export const setCurrentUser = (state: CurrentUser | undefined) =>
  $currentUser.set(state)
