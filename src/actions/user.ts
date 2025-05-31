import { defineAction, ActionError } from 'astro:actions'
import {
  upsertUser,
  getUserById,
  getUserByUsername,
  getAllUsers,
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
        regionId: z.string().optional().nullable(),
        id: z.string().optional()
      })
      .refine(
        (data) => {
          // If either password field is provided, both must be defined
          if (data.password || data.confirmPassword) {
            if (!data.password || !data.confirmPassword) {
              return false
            }
            // Both are defined, they must match exactly
            return data.password === data.confirmPassword
          }
          // No password fields provided, that's ok (might be an update)
          return true
        },
        {
          message:
            'Kedua kolom password wajib diisi, dan harus sama kedua-duanya.',
          path: ['confirmPassword']
        }
      ),
    handler: async ({ profilePhotoFile, ...input }) => {
      const existingUser = await getUserByUsername(input.username)

      let profilePhoto
      if (profilePhotoFile) {
        if (existingUser && existingUser.profilePhoto) {
          await deleteS3(existingUser.profilePhoto)
        }

        profilePhoto = `user-${input.username}-${Bun.randomUUIDv7()}.${profilePhotoFile.name.lastIndexOf('.')}`
        await uploadS3(profilePhotoFile, profilePhoto)
      }
      // Prepare user data, hashing password if provided
      const userData = {
        username: input.username,
        accessLevel: input.accessLevel,
        passwordHash: input.password
          ? await hashPassword(input.password)
          : null,
        fullName: input.fullName,
        phoneNumber: input.phoneNumber ?? null,
        profilePhoto: profilePhoto ?? null,
        regionId: input.regionId ?? null,
        ...(input.id ? { id: input.id } : {})
      }

      return await upsertUser(userData)
    }
  }),

  /**
   * Get a user by their id.
   * @param id User id
   * @returns User object or undefined if not found
   */
  getById: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }) => getUserById(id)
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
   * @param page Page number (1-based, defaults to 1)
   * @param size Page size (defaults to 10)
   * @returns Array of users for the page
   */
  getAll: defineAction({
    input: z.object({
      page: z.number().optional(),
      size: z.number().optional()
    }),
    handler: async ({ page, size }) => getAllUsers(page, size)
  }),

  /**
   * Delete a user by id and all their associated sessions.
   * @param id User id
   * @returns void
   */
  delete: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }) => {
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
  }
}

export default user

// password tools
const hashPassword = async (password: string) =>
  await Bun.password.hash(password)

const verifyPassword = async (password: string, hash: string) =>
  Bun.password.verify(password, hash)
