import { defineAction, ActionError } from 'astro:actions'
import {
  upsertUser,
  getUserById,
  getUserByUsername,
  getUserByPhoneNumber,
  getAllUsers,
  searchUsers,
  deleteUser
} from '../db/queries/user'
import {
  generateSessionToken,
  createSession,
  invalidateAllSession
} from '../auth/api'
import {
  setSessionTokenCookie,
  deleteSessionTokenCookie
} from '../auth/cookies'
import { z } from 'astro:schema'
import { deleteS3, uploadS3 } from '~/lib/s3'
import { getFileHash } from '~/utils/file-hash'

/**
 * Astro Actions for User table
 * Each action corresponds to a query function for user data operations.
 */

const user = {
  /**
   * Upsert (insert or update) a user.
   * @param data User data (username, accessLevel, passwordHash, fullName, phoneNumber?, profilePhoto?, regionId, id?)
   * @returns The newly created or updated user object
   */
  upsert: defineAction({
    accept: 'form',
    input: z
      .object({
        username: z.string(),
        accessLevel: z.number(),
        password: z.string().min(8).optional(),
        confirmPassword: z.string().optional(),
        fullName: z.string(),
        phoneNumber: z.string().optional(),
        profilePhotoFile: z.instanceof(File).optional(),
        regionId: z
          .string()
          .optional()
          .nullable()
          .transform((val) => {
            // Convert empty string to null
            if (val === '' || val === undefined) return null
            return val
          }),
        id: z.string().optional()
      })
      .refine(
        (data) => {
          // For new users (no id), password is required
          if (!data.id) {
            if (!data.password || !data.confirmPassword) {
              return false
            }
            // Both are provided, they must match exactly
            return data.password === data.confirmPassword
          }

          // For existing users (with id), password is optional
          // If either password field is provided, both must be defined and match
          if (data.password || data.confirmPassword) {
            if (!data.password || !data.confirmPassword) {
              return false
            }
            // Both are defined, they must match exactly
            return data.password === data.confirmPassword
          }
          // No password fields provided for update, that's ok
          return true
        },
        {
          message:
            'Kedua kolom password wajib diisi, dan harus sama kedua-duanya.',
          path: ['confirmPassword']
        }
      ),
    handler: async ({ profilePhotoFile, ...input }, ctx) => {
      const currentUser = ctx.locals.user

      // Only coordinators (level 3) and above can create/edit users
      if (!currentUser || currentUser.accessLevel < 3) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message:
            'Hanya koordinator dan administrator yang dapat mengelola pengguna.'
        })
      }

      // Additional restrictions for coordinators (level 3)
      if (currentUser.accessLevel === 3) {
        // Coordinators cannot create/edit users with higher or equal access level
        if (input.accessLevel >= 3) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Anda tidak dapat membuat atau mengedit pengguna dengan level akses coordinator atau administrator.'
          })
        }

        // If editing an existing user, check their current access level
        if (input.id) {
          const targetUser = await getUserById(input.id)
          if (!targetUser) {
            throw new ActionError({
              code: 'NOT_FOUND',
              message: 'Pengguna tidak ditemukan.'
            })
          }

          if (targetUser.accessLevel >= 3) {
            throw new ActionError({
              code: 'FORBIDDEN',
              message:
                'Anda tidak dapat mengedit pengguna dengan level akses coordinator atau administrator.'
            })
          }

          // Check if coordinator can edit this user
          const { canUserEditUser } = await import('../utils/access-control')
          let currentUserRegion = null
          let targetUserRegion = null

          if (currentUser.regionId) {
            const { getRegionById } = await import('../db/queries/region')
            currentUserRegion = await getRegionById(currentUser.regionId)
          }

          if (targetUser.regionId) {
            const { getRegionById } = await import('../db/queries/region')
            targetUserRegion = await getRegionById(targetUser.regionId)
          }

          if (
            !canUserEditUser(
              currentUser,
              targetUser,
              currentUserRegion,
              targetUserRegion
            )
          ) {
            throw new ActionError({
              code: 'FORBIDDEN',
              message: 'Anda tidak memiliki izin untuk mengedit pengguna ini.'
            })
          }
        }

        // Check if coordinator can assign user to the specified region
        if (input.regionId) {
          const { getRegionById } = await import('../db/queries/region')
          const { canUserAssignToRegion } = await import(
            '../utils/access-control'
          )

          const targetRegion = await getRegionById(input.regionId)
          let currentUserRegion = null

          if (currentUser.regionId) {
            currentUserRegion = await getRegionById(currentUser.regionId)
          }

          if (
            !targetRegion ||
            !canUserAssignToRegion(currentUser, targetRegion, currentUserRegion)
          ) {
            throw new ActionError({
              code: 'FORBIDDEN',
              message:
                'Anda tidak dapat menugaskan pengguna ke wilayah tersebut.'
            })
          }
        }
      }

      const existingUser = await getUserByUsername(input.username)

      // Check for phone number uniqueness if phone number is provided
      if (input.phoneNumber && input.phoneNumber.trim() !== '') {
        const existingPhoneUser = await getUserByPhoneNumber(input.phoneNumber)

        // If a user with this phone number exists and it's not the same user we're updating
        if (existingPhoneUser && existingPhoneUser.id !== input.id) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: `Nomor telepon ${input.phoneNumber} sudah digunakan oleh pengguna lain. Silakan gunakan nomor telepon yang berbeda.`
          })
        }
      }

      let profilePhoto
      if (profilePhotoFile && profilePhotoFile.name) {
        if (existingUser && existingUser.profilePhoto) {
          await deleteS3(existingUser.profilePhoto)
        }

        const hashHex = await getFileHash(profilePhotoFile)
        profilePhoto = `user-${input.username}-${hashHex}.${profilePhotoFile.name.split('.').pop() || ''}`
        await uploadS3(profilePhotoFile, profilePhoto)
      }
      // Prepare user data, hashing password if provided
      const userData: {
        username: string
        accessLevel: number
        passwordHash: string | null
        fullName: string
        phoneNumber: string | null
        profilePhoto: string | null
        regionId: string | null
        id?: string
      } = {
        username: input.username,
        accessLevel: input.accessLevel,
        fullName: input.fullName,
        phoneNumber: input.phoneNumber ?? null,
        profilePhoto: profilePhoto ?? null,
        regionId: input.regionId ?? null,
        passwordHash: null, // Initialize with null, will be set below
        ...(input.id ? { id: input.id } : {})
      }

      // Handle password: hash if provided, preserve existing if editing without new password
      if (input.password) {
        userData.passwordHash = await hashPassword(input.password)
      } else if (input.id) {
        // Editing existing user without new password - preserve existing passwordHash
        const existingUser = await getUserById(input.id)
        userData.passwordHash = existingUser?.passwordHash ?? null
      } else {
        // New user without password - this should not happen due to validation
        userData.passwordHash = null
      }

      return await upsertUser(userData)
    }
  }),

  /**
   * Get a user by their id.
   * Requires coordinator level access or above.
   * @param id User id
   * @returns User object or undefined if not found
   */
  getById: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }, ctx) => {
      const currentUser = ctx.locals.user

      // Allow users to get their own profile data
      if (currentUser && currentUser.id === id) {
        return getUserById(id)
      }

      // Only coordinators (level 3) and above can view other users' details
      if (!currentUser || currentUser.accessLevel < 3) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki izin untuk melihat detail pengguna ini.'
        })
      }

      return getUserById(id)
    }
  }),

  /**
   * Get a user by their username.
   * @param username Username to look up
   * @returns User object or undefined if not found
   */
  getByUsername: defineAction({
    input: z.object({ username: z.string() }),
    handler: async ({ username }) => getUserByUsername(username)
  }),

  /**
   * Get the currently logged in user from the session.
   * This action doesn't require any input as it uses the session context.
   *
   * @returns The currently logged in user object from ctx.locals.user,
   *          which will be undefined if no user is logged in.
   * @example
   * const currentUser = await actions.user.getCurrent()
   * if (currentUser) {
   *   // User is logged in
   *   console.log(currentUser.username)
   * }
   */
  getCurrent: defineAction({
    handler: async (_, ctx) => {
      return ctx.locals.user
    }
  }),

  /**
   * Get a paginated list of users.
   * Requires coordinator level access or above.
   * @param page Page number (1-based, defaults to 1)
   * @param size Page size (defaults to 10)
   * @returns Array of users for the page
   */
  getAll: defineAction({
    input: z.object({
      page: z.number().optional(),
      size: z.number().optional()
    }),
    handler: async ({ page, size }, ctx) => {
      const currentUser = ctx.locals.user

      // Only coordinators (level 3) and above can view user lists
      if (!currentUser || currentUser.accessLevel < 3) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message:
            'Hanya koordinator dan administrator yang dapat melihat daftar pengguna.'
        })
      }

      // Get all users first
      const allUsers = await getAllUsers(page, size)

      // If admin, return all users
      if (currentUser.accessLevel >= 4) {
        return allUsers
      }

      // For coordinators, filter users based on access control
      if (currentUser.accessLevel === 3) {
        // Get current user's region for filtering
        let currentUserRegion = null
        if (currentUser.regionId) {
          const { getRegionById } = await import('../db/queries/region')
          currentUserRegion = await getRegionById(currentUser.regionId)
        }

        // Filter users that the coordinator can access
        const { canUserAccessUser } = await import('../utils/access-control')

        const filteredUsers = []
        for (const user of allUsers) {
          let targetUserRegion = null
          if (user.regionId) {
            const { getRegionById } = await import('../db/queries/region')
            targetUserRegion = await getRegionById(user.regionId)
          }

          if (
            canUserAccessUser(
              currentUser,
              user,
              currentUserRegion,
              targetUserRegion
            )
          ) {
            filteredUsers.push(user)
          }
        }

        return filteredUsers
      }

      return allUsers
    }
  }),

  /**
   * Search users by name, village/region, or phone number.
   * Requires coordinator level access or above.
   * @param searchTerm Search term to filter by
   * @param page Page number (1-based, defaults to 1)
   * @param size Page size (defaults to 10)
   * @returns Array of users matching the search term
   */
  search: defineAction({
    input: z.object({
      searchTerm: z.string().min(1),
      page: z.number().optional(),
      size: z.number().optional()
    }),
    handler: async ({ searchTerm, page, size }, ctx) => {
      const currentUser = ctx.locals.user

      // Only coordinators (level 3) and above can search users
      if (!currentUser || currentUser.accessLevel < 3) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message:
            'Hanya koordinator dan administrator yang dapat mencari pengguna.'
        })
      }

      // Get search results first
      const searchResults = await searchUsers(searchTerm, page, size)

      // If admin, return all results
      if (currentUser.accessLevel >= 4) {
        return searchResults
      }

      // For coordinators, filter results based on access control
      if (currentUser.accessLevel === 3) {
        // Get current user's region for filtering
        let currentUserRegion = null
        if (currentUser.regionId) {
          const { getRegionById } = await import('../db/queries/region')
          currentUserRegion = await getRegionById(currentUser.regionId)
        }

        // Filter search results that the coordinator can access
        const { canUserAccessUser } = await import('../utils/access-control')

        const filteredResults = []
        for (const user of searchResults) {
          let targetUserRegion = null
          if (user.regionId) {
            const { getRegionById } = await import('../db/queries/region')
            targetUserRegion = await getRegionById(user.regionId)
          }

          if (
            canUserAccessUser(
              currentUser,
              user,
              currentUserRegion,
              targetUserRegion
            )
          ) {
            filteredResults.push(user)
          }
        }

        return filteredResults
      }

      return searchResults
    }
  }),

  /**
   * Delete a user by id and all their associated sessions.
   * Prevents users from deleting their own account for security.
   * @param id User id
   * @returns void
   */
  delete: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }, ctx) => {
      const currentUser = ctx.locals.user

      // Prevent user from deleting their own account
      if (currentUser && currentUser.id === id) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak dapat menghapus akun Anda sendiri.'
        })
      }

      // Only allow admins to delete users
      if (!currentUser || currentUser.accessLevel < 4) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Hanya administrator yang dapat menghapus pengguna.'
        })
      }

      // Get target user to check access permissions
      const targetUser = await getUserById(id)
      if (!targetUser) {
        throw new ActionError({
          code: 'NOT_FOUND',
          message: 'Pengguna tidak ditemukan.'
        })
      }

      // Use access control to check if deletion is allowed
      const { canUserDeleteUser } = await import('../utils/access-control')

      // Get region information for access control
      let currentUserRegion = null
      let targetUserRegion = null

      if (currentUser.regionId) {
        const { getRegionById } = await import('../db/queries/region')
        currentUserRegion = await getRegionById(currentUser.regionId)
      }

      if (targetUser.regionId) {
        const { getRegionById } = await import('../db/queries/region')
        targetUserRegion = await getRegionById(targetUser.regionId)
      }

      if (
        !canUserDeleteUser(
          currentUser,
          targetUser,
          currentUserRegion,
          targetUserRegion
        )
      ) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda tidak dapat menghapus pengguna ini.'
        })
      }

      await invalidateAllSession(id) // First delete all user sessions
      await deleteUser(id) // Then delete the user
    }
  }),

  auth: {
    /**
     * Login with username and password.
     * On success, creates a new session and sets the session token in a cookie.
     *
     * @throws {ActionError} with "UNAUTHORIZED" code if login fails
     */
    login: defineAction({
      accept: 'form',
      input: z.object({
        username: z.string(),
        password: z.string()
      }),
      handler: async ({ username, password }, ctx) => {
        const InvalidUsernameAndOrPassword = new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Username dan/atau password yang anda masukkan salah.'
        })

        // 1. Get user by username
        const user = await getUserByUsername(username)
        if (!user) {
          throw InvalidUsernameAndOrPassword
        }

        // 2. Verify password
        if (
          !user.passwordHash ||
          !(await verifyPassword(password, user.passwordHash))
        ) {
          throw InvalidUsernameAndOrPassword
        }

        // 3. Generate session token and create session
        const token = generateSessionToken()
        const session = await createSession(token, user.id)

        // 4. Set session token in cookie if session was created
        if (!session || !session.session) {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Terjadi masalah internal.'
          })
        }

        setSessionTokenCookie(ctx, token, session.session.expiresAt)
      }
    }),

    /**
     * Logout the current user by invalidating all their sessions.
     * Also clears the session cookie.
     *
     * @returns {Promise<void>}
     */
    logout: defineAction({
      handler: async (_, ctx) => {
        const user = ctx.locals.user
        if (!user) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Operasi terbatas!'
          })
        }
        // Clear the session cookie
        await invalidateAllSession(user.id)
        deleteSessionTokenCookie(ctx)
      }
    })
  },

  checks: {
    isNoAdmin: defineAction({
      handler: async () => {
        const admins = await getAllUsers().then((users) =>
          users.filter((user) => user.accessLevel >= 4)
        )
        if (admins.length > 0) {
          return false
        } else {
          return true
        }
      }
    })
  }
}

export default user

// password tools
const hashPassword = async (password: string) =>
  await Bun.password.hash(password)

const verifyPassword = async (password: string, hash: string) =>
  Bun.password.verify(password, hash)
