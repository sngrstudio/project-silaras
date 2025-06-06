import { atom } from 'nanostores'
import { actions } from 'astro:actions'

/**
 * @fileoverview Users Store
 *
 * Manages state for user management interface within the SILARAS system.
 * This store handles the list of users, pagination, and current user selection
 * for administrative operations like editing and deleting users.
 *
 * Features:
 * - Paginated user listing with metadata
 * - Current user selection for CRUD operations
 * - Page navigation state management
 * - Integration with user management actions
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

/**
 * Type definition for users data with pagination
 * Retrieved from the user.getAll action, contains paginated user list
 * and metadata about total count, current page, etc.
 */
export type Users = Awaited<ReturnType<typeof actions.user.getAll.orThrow>>

/**
 * Nanostore for users data with pagination metadata
 * Contains the current page of users and pagination information
 *
 * Structure includes:
 * - users: Array of user objects for current page
 * - totalCount: Total number of users across all pages
 * - currentPage: Current page number
 * - pageSize: Number of users per page
 *
 * @default undefined - No users loaded initially
 */
export const $users = atom<Users | undefined>(undefined)

/**
 * Setter function for users state
 * Used to update the store with new users data from API calls
 *
 * @param state - New users data with pagination, or undefined to clear
 */
export const setUsers = (state: Users | undefined) => $users.set(state)

/**
 * Type definition for individual user data
 * Represents a single user from the users array
 */
export type User = Users['users'][number]

/**
 * Nanostore for currently selected user
 * Holds the user data when editing or viewing user details
 *
 * Used for:
 * - Opening user edit modal with pre-filled data
 * - Displaying user details in dialogs
 * - Managing user selection state
 *
 * @default undefined - No user selected initially
 */
export const $currentUser = atom<User | undefined>(undefined)

/**
 * Setter function for current user selection
 * Used to select a user for editing or clear the selection
 *
 * @param state - User data to select, or undefined to clear selection
 */
export const setCurrentUser = (state: User | undefined) =>
  $currentUser.set(state)

/**
 * Nanostore for current page number
 * Tracks the current page in the paginated user list
 *
 * Used for:
 * - Pagination navigation controls
 * - API calls with correct page parameter
 * - UI state consistency during navigation
 *
 * @default 1 - Start at first page
 */
export const $currentPage = atom<number>(1)

/**
 * Setter function for current page state
 * Used to navigate between pages in the user list
 *
 * @param page - Page number to set as current (1-based indexing)
 */
export const setCurrentPage = (page: number) => $currentPage.set(page)
