import { defineAction, ActionError } from 'astro:actions'
import { db } from '~/db/db'
import {
  userTable,
  userProfileTable,
  userView,
  accessLevelMapTable
} from '~/db/schema/user'
import {
  setSessionTokenCookie,
  deleteSessionTokenCookie,
  AUTH_COOKIE_NAME
} from '~/auth/cookies'
import {
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession
} from '~/auth/api'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { z } from 'astro:schema'
import { eq, sql } from 'drizzle-orm'

// input schemas
const createuserSchema = z
  .object({})
  .merge(
    createInsertSchema(userTable, {
      userName: (s) =>
        s.min(4, 'Username minimal sepanjang 4 karakter atau lebih.')
    })
  )
  .merge(createInsertSchema(userProfileTable))
  .omit({ id: true, userId: true, passwordHash: true })
  .extend({
    password: z
      .string()
      .min(8, 'Password minimal sepanjang 8 karakter atau lebih.'),
    confirmPassword: z.string()
  })

const updateUserSchema = z
  .object({})
  .merge(createUpdateSchema(userProfileTable).omit({ userId: true }))
  .merge(createUpdateSchema(userTable).pick({ accessLevel: true }))
  .extend({
    requestedBy: z.string()
  })

const loginSchema = createuserSchema.pick({ userName: true, password: true })

const user = {
  create: defineAction({
    accept: 'form',
    input: createuserSchema.refine(
      ({ password, confirmPassword }) => password === confirmPassword,
      {
        message: 'Password harus sama di kedua kolom.',
        path: ['confirmPassword']
      }
    ),
    handler: async ({
      userName,
      password,
      accessLevel,
      fullName,
      phoneNumber,
      profilePhoto
    }) => {
      try {
        return await db.transaction(async (tx) => {
          // check for existing user
          const [existingUser] = await getUserByUsernameSQL.execute({
            userName
          })
          console.log(existingUser)
          if (existingUser) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'Username sudah terdaftar.'
            })
          }

          // if no user found, proceed to hash password
          const passwordHash = await hashPassword(password)
          // save new user to db and immediately retrieve it
          await insertUserSQL.execute({ userName, accessLevel, passwordHash })
          const [freshUser] = await getUserByUsernameSQL.execute({ userName })
          if (freshUser) {
            // insert supplied user profile
            await insertUserProfileSQL.execute({
              fullName,
              phoneNumber,
              profilePhoto,
              userId: freshUser.id
            })

            return freshUser
          } else {
            tx.rollback()
            return undefined
          }
        })
      } catch (error) {
        console.log(error)
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Terjadi masalah di server kami.'
        })
      }
    }
  }),

  getCurrentUser: defineAction({
    handler: async (_, ctx) => {
      try {
        const localUser = ctx.locals.user
        if (!localUser) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Operasi terbatas!'
          })
        }

        const [returnedUser] = await getUserSQL.execute({
          userId: localUser.userId
        })
        if (!returnedUser) {
          throw new ActionError({
            code: 'NOT_FOUND',
            message: 'User tidak ditemukan.'
          })
        }

        return returnedUser
      } catch (error) {
        console.log(error)
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Terjadi masalah di server kami.'
        })
      }
    }
  }),

  update: defineAction({
    accept: 'form',
    input: updateUserSchema,
    handler: async (input, ctx) => {
      try {
        const RestrictedActionError = new ActionError({
          code: 'FORBIDDEN',
          message: 'Operasi terbatas!'
        })

        const { requestedBy, accessLevel, ...userProfile } = input
        const localUser = ctx.locals.user

        if (!localUser) {
          throw RestrictedActionError
        }

        const isCurrentUser = localUser.userName === requestedBy
        const isAdmin = localUser.accessLevel === 4

        if (!isAdmin && !isCurrentUser) {
          throw RestrictedActionError
        }

        await db.transaction(async (tx) => {
          const updateUserProfileTableSQL = tx
            .update(userProfileTable)
            .set({ ...userProfile })
            .where(eq(userProfileTable.userId, localUser.userId))
            .prepare()

          await updateUserProfileTableSQL.execute()

          if (accessLevel) {
            const updateUserTableSQL = tx
              .update(userTable)
              .set({ accessLevel })
              .where(eq(userTable.id, localUser.userId))
              .prepare()

            await updateUserTableSQL.execute()
          }
        })

        const [updatedUser] = await getUserSQL.execute({
          userId: localUser.userId
        })
        if (!updatedUser) {
          throw new ActionError({
            code: 'NOT_FOUND',
            message: 'User tidak ditemukan.'
          })
        }

        return updatedUser
      } catch (error) {
        console.log(error)
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Terjadi masalah di server kami.'
        })
      }
    }
  }),

  // delete: defineAction({
  //   handler: (_, ctx) => {}
  // }),

  auth: {
    login: defineAction({
      accept: 'form',
      input: loginSchema,
      handler: async ({ userName, password }, ctx) => {
        try {
          const InvalidUsernameAndOrPassword = new ActionError({
            code: 'UNAUTHORIZED',
            message: 'Username dan/atau password yang anda masukkan salah.'
          })

          // get the user and test if user is exist
          const [user] = await getUserWithPasswordHashSQL.execute({ userName })
          if (!user) {
            throw InvalidUsernameAndOrPassword
          }

          // check password
          const isPasswordValid = await verifyPassword(
            password,
            user.passwordHash
          )
          if (!isPasswordValid) {
            throw InvalidUsernameAndOrPassword
          }

          // proceed to login
          const token = generateSessionToken()
          const session = await createSession(token, user.id)
          setSessionTokenCookie(ctx, token, session.expiresAt)
        } catch (error) {
          console.log(error)
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Terjadi masalah di server kami.'
          })
        }
      }
    }),

    logout: defineAction({
      handler: async (_, ctx) => {
        try {
          // find token and test if token actually exist
          const token = ctx.cookies.get(AUTH_COOKIE_NAME)?.value
          if (!token) {
            throw new ActionError({
              code: 'FORBIDDEN',
              message: 'Operasi tidak diizinkan.'
            })
          }

          // validate token before logout, then delete session from db along with token
          const { session } = await validateSessionToken(token)
          if (session) {
            await invalidateSession(session.id)
          }

          deleteSessionTokenCookie(ctx)
        } catch (error) {
          console.log(error)
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Terjadi masalah di server kami.'
          })
        }
      }
    })
  },

  accessLevels: {
    get: defineAction({
      handler: async () => {
        try {
          return await getAccessLevelsSQL.execute()
        } catch (error) {
          console.log(error)
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Terjadi masalah di server kami.'
          })
        }
      }
    })
  },

  checks: {
    isUserEmpty: defineAction({
      handler: async () => {
        try {
          const users = await getUsersSQL.execute()

          if (users.length < 1) {
            return true
          } else {
            return false
          }
        } catch (error) {
          console.log(error)
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Terjadi masalah di server kami.'
          })
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

// prepared SQLs
const insertUserSQL = db
  .insert(userTable)
  .values({
    userName: sql.placeholder('userName'),
    accessLevel: sql.placeholder('accessLevel'),
    passwordHash: sql.placeholder('passwordHash')
  })
  .prepare()

const insertUserProfileSQL = db
  .insert(userProfileTable)
  .values({
    userId: sql.placeholder('userId'),
    fullName: sql.placeholder('fullName'),
    phoneNumber: sql.placeholder('phoneNumber'),
    profilePhoto: sql.placeholder('profilePhoto')
  })
  .prepare()

const getUserSQL = db
  .select({
    userName: userView.userName,
    fullName: userView.fullName,
    phoneNumber: userView.phoneNumber,
    profilePhoto: userView.profilePhoto,
    accessLevel: userView.accessLevel
  })
  .from(userView)
  .where(eq(userView.userId, sql.placeholder('userId')))
  .prepare()

const getUsersSQL = db.select().from(userView).prepare()

const getUserByUsernameSQL = db
  .select()
  .from(userTable)
  .where(eq(userTable.userName, sql.placeholder('userName')))
  .prepare()

const getUserWithPasswordHashSQL = db
  .select({
    id: userTable.id,
    passwordHash: userTable.passwordHash
  })
  .from(userTable)
  .where(eq(userTable.userName, sql.placeholder('userName')))
  .prepare()

const getAccessLevelsSQL = db.select().from(accessLevelMapTable).prepare()
