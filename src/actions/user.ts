import { defineAction, ActionError } from 'astro:actions'
import {
  upsertUser,
  getUserById,
  getUserByUsername,
  getUserByUsernameForAuth,
  getUserByPhoneNumber,
  getUserPasswordHashById,
  getAllUsers,
  searchUsers,
  deleteUser,
  isNoSuperAdmin
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
import { getRegionById, getRegionsByType } from '../db/queries/region' // Added getRegionsByType
import {
  canUserEditUser,
  canUserAccessUser,
  canUserDeleteUser,
  canUserAssignToRegion
} from '../utils/access-control'

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
      const isCreatingNewUser = !input.id
      let isFirstAdminSignupScenario = false

      // Determine if this is the scenario for the first admin signup
      if (isCreatingNewUser && !currentUser) {
        const existingUsersResult = await getAllUsers(1, 1)
        const superAdminExists = existingUsersResult.users.some(
          (u) => u.accessLevel >= 5
        )
        if (!superAdminExists) {
          isFirstAdminSignupScenario = true
        }
      }

      if (isCreatingNewUser && !currentUser) {
        if (isFirstAdminSignupScenario) {
          // This is the first Super Administrator account creation
          if (input.accessLevel !== 5) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message:
                'Akun Super Administrator pertama harus memiliki level akses 5.'
            })
          }
          // Automatically assign the first admin to the KABUPATEN region
          const kabupatenRegions = await getRegionsByType('KABUPATEN')
          if (!kabupatenRegions || kabupatenRegions.length === 0) {
            throw new ActionError({
              code: 'INTERNAL_SERVER_ERROR',
              message:
                'Konfigurasi wilayah KABUPATEN tidak ditemukan. Silakan hubungi administrator sistem.'
            })
          }
          // Safely access the first KABUPATEN region's ID
          const kabupatenToAssign = kabupatenRegions[0]
          if (!kabupatenToAssign) {
            // Additional check for safety, though theoretically covered by above
            throw new ActionError({
              code: 'INTERNAL_SERVER_ERROR',
              message:
                'Tidak dapat menentukan wilayah KABUPATEN untuk Super Administrator pertama.'
            })
          }
          input.regionId = kabupatenToAssign.id
        } else {
          // This is a regular public signup (not the first Super Admin)
          // Enforce a default access level, e.g., 2 (Kader DASHAT).
          if (input.accessLevel !== 2) {
            // Assuming 2 is the default for public signups (Kader DASHAT)
            throw new ActionError({
              code: 'BAD_REQUEST',
              message:
                'Level akses tidak valid untuk pendaftaran publik. Seharusnya level 2 (Kader DASHAT).'
            })
          }
          // For regular signups, regionId is optional as per schema.
          // If it were mandatory, a check like !input.regionId would be needed here.
        }
      } else if (currentUser) {
        // Logged-in user is creating or editing another user
        if (currentUser.accessLevel < 3) {
          // Must be PLKB Kecamatan (3) or Admin Dinas PPPAPPKB (4) or Super Administrator (5)
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Hanya PLKB Kecamatan dan administrator yang dapat mengelola pengguna.'
          })
        }

        // Additional restrictions for PLKB Kecamatan (level 3) when managing other users
        if (currentUser.accessLevel === 3) {
          // PLKB Kecamatan cannot create/edit users with higher or equal access level (level 3, 4, or 5)
          if (input.accessLevel >= 3) {
            throw new ActionError({
              code: 'FORBIDDEN',
              message:
                'Anda tidak dapat membuat atau mengedit pengguna dengan level akses PLKB Kecamatan atau administrator.'
            })
          }

          if (input.id) {
            // If editing an existing user
            const targetUser = await getUserById(input.id)
            if (!targetUser) {
              throw new ActionError({
                code: 'NOT_FOUND',
                message: 'Pengguna tidak ditemukan.'
              })
            }
            // PLKB Kecamatan cannot edit another PLKB Kecamatan or admin (already checked by input.accessLevel for new, now for existing)
            if (targetUser.accessLevel >= 3) {
              throw new ActionError({
                code: 'FORBIDDEN',
                message:
                  'Anda tidak dapat mengedit pengguna dengan level akses PLKB Kecamatan atau administrator.'
              })
            }
            // Region-based access control for editing by coordinator
            let currentUserRegion = null
            let targetUserRegion = null
            if (currentUser.regionId) {
              currentUserRegion = await getRegionById(currentUser.regionId)
            }
            if (targetUser.regionId) {
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
        } // End of coordinator specific checks (currentUser.accessLevel === 3)

        // Region assignment checks for privileged users (admin/coordinator creating/editing users)
        // This applies if a regionId is being set or changed for the target user.
        if (input.regionId) {
          const targetRegion = await getRegionById(input.regionId)
          if (!targetRegion) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'Wilayah yang dipilih tidak valid.'
            })
          }
          let userRegionForCheck = null // This is the current (admin/coord) user's region
          if (currentUser.regionId) {
            userRegionForCheck = await getRegionById(currentUser.regionId)
          }
          // Check if the current admin/coordinator can assign a user to the targetRegion
          if (
            !canUserAssignToRegion(
              currentUser,
              targetRegion,
              userRegionForCheck
            )
          ) {
            throw new ActionError({
              code: 'FORBIDDEN',
              message:
                'Anda tidak dapat menugaskan pengguna ke wilayah tersebut.'
            })
          }
        }
      } else if (!isCreatingNewUser && !currentUser) {
        // Trying to edit a user without being logged in
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Anda harus login untuk melakukan operasi ini.'
        })
      } else {
        // This case should ideally not be reached if logic is correct,
        // but acts as a fallback for any unhandled unauthenticated/unauthorized state.
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Operasi tidak diizinkan.'
        })
      }

      // Validate region assignment based on access level
      if (input.accessLevel === 3) {
        // PLKB Kecamatan requires a kecamatan assignment
        if (!input.regionId) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'PLKB Kecamatan harus ditempatkan di wilayah kecamatan.'
          })
        }

        // Verify that the assigned region is actually a kecamatan
        const assignedRegion = await getRegionById(input.regionId)
        if (!assignedRegion || assignedRegion.type !== 'KECAMATAN') {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message:
              'PLKB Kecamatan harus ditempatkan di wilayah kecamatan yang valid.'
          })
        }
      }

      if (input.accessLevel === 2) {
        // Kader DASHAT requires a desa assignment
        if (!input.regionId) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Kader DASHAT harus ditempatkan di wilayah desa.'
          })
        }

        // Verify that the assigned region is actually a desa
        const assignedRegion = await getRegionById(input.regionId)
        if (!assignedRegion || assignedRegion.type !== 'DESA') {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message:
              'Kader DASHAT harus ditempatkan di wilayah desa yang valid.'
          })
        }
      }

      const existingUser = await getUserByUsername(input.username)

      // Check for username uniqueness
      if (existingUser && existingUser.id !== input.id) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: `Username "${input.username}" sudah digunakan oleh pengguna lain. Silakan gunakan username yang berbeda.`
        })
      }

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
        const existingPasswordHash = await getUserPasswordHashById(input.id)
        userData.passwordHash = existingPasswordHash ?? null
      } else {
        // New user without password - this should not happen due to validation
        userData.passwordHash = null
      }

      try {
        return await upsertUser(userData)
      } catch (dbError: any) {
        // Handle database constraint violations
        if (dbError.code === 'ER_DUP_ENTRY' || dbError.errno === 1062) {
          if (dbError.message.includes('username')) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: `Username "${input.username}" sudah digunakan oleh pengguna lain. Silakan gunakan username yang berbeda.`
            })
          } else if (dbError.message.includes('phone_number')) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: `Nomor telepon ${input.phoneNumber} sudah digunakan oleh pengguna lain. Silakan gunakan nomor telepon yang berbeda.`
            })
          } else {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message:
                'Data yang dimasukkan sudah ada di sistem. Silakan periksa kembali.'
            })
          }
        }

        // Handle foreign key constraint violations
        if (
          dbError.code === 'ER_NO_REFERENCED_ROW_2' ||
          dbError.errno === 1452
        ) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Wilayah yang dipilih tidak valid atau tidak tersedia.'
          })
        }

        // Re-throw the original error if it's not a constraint violation
        throw dbError
      }
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
   * Requires PLKB Kecamatan level access or above.
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

      // Only PLKB Kecamatan (level 3) and above can view user lists
      if (!currentUser || currentUser.accessLevel < 3) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message:
            'Hanya PLKB Kecamatan dan administrator yang dapat melihat daftar pengguna.'
        })
      }

      // Get all users first
      const allUsersResult = await getAllUsers(page, size)

      // If Admin Dinas PPPAPPKB or Super Administrator, return all users
      if (currentUser.accessLevel >= 4) {
        return allUsersResult
      }

      // For PLKB Kecamatan, filter users based on access control
      if (currentUser.accessLevel === 3) {
        // Get current user's region for filtering
        let currentUserRegion = null
        if (currentUser.regionId) {
          currentUserRegion = await getRegionById(currentUser.regionId)
        }

        // Filter users that the PLKB Kecamatan can access
        const filteredUsers = []
        for (const user of allUsersResult.users) {
          let targetUserRegion = null
          if (user.regionId) {
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

        return { users: filteredUsers, totalCount: filteredUsers.length }
      }

      return allUsersResult
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
      const searchResultsData = await searchUsers(searchTerm, page, size)

      // If admin, return all results
      if (currentUser.accessLevel >= 4) {
        return searchResultsData
      }

      // For coordinators, filter results based on access control
      if (currentUser.accessLevel === 3) {
        // Get current user's region for filtering
        let currentUserRegion = null
        if (currentUser.regionId) {
          currentUserRegion = await getRegionById(currentUser.regionId)
        }

        // Filter search results that the coordinator can access
        const filteredResults = []
        for (const user of searchResultsData.users) {
          let targetUserRegion = null
          if (user.regionId) {
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

        return { users: filteredResults, totalCount: filteredResults.length }
      }

      return searchResultsData
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

      // Only allow PLKB Kecamatan (3), Admin Dinas PPPAPPKB (4) and Super Administrator (5) to delete users
      if (!currentUser || currentUser.accessLevel < 3) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message:
            'Hanya PLKB Kecamatan dan administrator yang dapat menghapus pengguna.'
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
      // Get region information for access control
      let currentUserRegion = null
      let targetUserRegion = null

      if (currentUser.regionId) {
        currentUserRegion = await getRegionById(currentUser.regionId)
      }

      if (targetUser.regionId) {
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

      try {
        await invalidateAllSession(id) // First delete all user sessions
        await deleteUser(id) // Then delete the user
      } catch (dbError: any) {
        // Handle foreign key constraint violations
        if (
          dbError.code === 'ER_ROW_IS_REFERENCED_2' ||
          dbError.errno === 1451
        ) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message:
              'Pengguna tidak dapat dihapus karena masih memiliki data terkait di sistem (seperti pasien atau data penilaian). Silakan hapus data terkait terlebih dahulu.'
          })
        }

        // Handle other database errors
        if (dbError.code && dbError.code.startsWith('ER_')) {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              'Terjadi masalah database saat menghapus pengguna. Silakan hubungi administrator.'
          })
        }

        // Re-throw the original error if it's not a database constraint
        throw dbError
      }
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

        // 1. Check rate limiting
        const clientIp =
          ctx.request.headers.get('x-forwarded-for') ||
          ctx.request.headers.get('x-real-ip') ||
          'unknown'

        if (isRateLimited(clientIp, username)) {
          throw new ActionError({
            code: 'TOO_MANY_REQUESTS',
            message:
              'Terlalu banyak percobaan login. Silakan tunggu beberapa menit.'
          })
        }

        // 2. Get user by username (with password hash for authentication)
        const user = await getUserByUsernameForAuth(username)
        if (!user) {
          // Record failed attempt for rate limiting
          recordLoginAttempt(clientIp, username, false)
          throw InvalidUsernameAndOrPassword
        }

        // 3. Check if user account is accessible
        // Users with access level 1 (viewers) are restricted for now as per existing logic
        if (user.accessLevel < 2) {
          recordLoginAttempt(clientIp, username, false)
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Akun Anda tidak memiliki izin untuk mengakses sistem.'
          })
        }

        // 4. Verify password
        if (
          !user.passwordHash ||
          !(await verifyPassword(password, user.passwordHash))
        ) {
          // Record failed attempt for rate limiting
          recordLoginAttempt(clientIp, username, false)
          throw InvalidUsernameAndOrPassword
        }

        // 5. Record successful attempt and clear failed attempts
        recordLoginAttempt(clientIp, username, true)

        // 6. Generate session token and create session
        const token = generateSessionToken()
        const session = await createSession(token, user.id)

        // 7. Set session token in cookie if session was created
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
      handler: async (): Promise<boolean> => {
        return await isNoSuperAdmin()
      }
    })
  }
}

export default user

// In-memory rate limiting for login attempts
// In production, consider using Redis or a database table for persistent rate limiting
interface LoginAttempt {
  timestamp: number
  count: number
  lastAttempt: number
}

const loginAttempts = new Map<string, LoginAttempt>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 60 * 1000 // 1 minute window for counting attempts

/**
 * Check if a client IP + username combination is rate limited
 * @param clientIp The client IP address
 * @param username The username being attempted
 * @returns true if rate limited, false otherwise
 */
function isRateLimited(clientIp: string, username: string): boolean {
  const key = `${clientIp}:${username}`
  const attempt = loginAttempts.get(key)

  if (!attempt) {
    return false
  }

  const now = Date.now()

  // If we're still in lockout period, check if enough time has passed
  if (attempt.count >= MAX_ATTEMPTS) {
    if (now - attempt.lastAttempt < LOCKOUT_DURATION) {
      return true
    } else {
      // Lockout period has expired, clear the record
      loginAttempts.delete(key)
      return false
    }
  }

  return false
}

/**
 * Record a login attempt (successful or failed)
 * @param clientIp The client IP address
 * @param username The username being attempted
 * @param success Whether the login was successful
 */
function recordLoginAttempt(
  clientIp: string,
  username: string,
  success: boolean
): void {
  const key = `${clientIp}:${username}`
  const now = Date.now()

  if (success) {
    // Clear failed attempts on successful login
    loginAttempts.delete(key)
    return
  }

  const attempt = loginAttempts.get(key)

  if (!attempt) {
    // First failed attempt
    loginAttempts.set(key, {
      timestamp: now,
      count: 1,
      lastAttempt: now
    })
  } else {
    // Check if this attempt is within the attempt window
    if (now - attempt.timestamp > ATTEMPT_WINDOW) {
      // Reset counter if outside attempt window
      loginAttempts.set(key, {
        timestamp: now,
        count: 1,
        lastAttempt: now
      })
    } else {
      // Increment counter within attempt window
      attempt.count++
      attempt.lastAttempt = now
      loginAttempts.set(key, attempt)
    }
  }
}

// Cleanup old entries periodically (every 30 minutes)
setInterval(
  () => {
    const now = Date.now()
    for (const [key, attempt] of loginAttempts.entries()) {
      // Remove entries older than lockout duration
      if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
        loginAttempts.delete(key)
      }
    }
  },
  30 * 60 * 1000
)

// password tools
const hashPassword = async (password: string) =>
  await Bun.password.hash(password)

const verifyPassword = async (password: string, hash: string) =>
  Bun.password.verify(password, hash)
