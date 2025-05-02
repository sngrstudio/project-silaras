import { defineAction, ActionError } from 'astro:actions'
import { userTable } from '~/db/schema/auth'
import { createInsertSchema } from 'drizzle-zod'
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession
} from '~/db/auth/api'
import {
  COOKIE_NAME,
  setSessionTokenCookie,
  deleteSessionTokenCookie
} from '~/db/auth/cookies'
import { db } from '~/db/db'
import { eq } from 'drizzle-orm'
import { z } from 'astro:schema'

const insertUserSchema = createInsertSchema(userTable).extend({
  password: z
    .string()
    .min(8, 'Password minimal terdiri dari delapan karakter.'),
  confirmPassword: z.string()
})

export const auth = {
  signup: defineAction({
    accept: 'form',
    input: insertUserSchema.refine(
      ({ password, confirmPassword }) => password === confirmPassword,
      {
        message: 'Password harus sama di kedua kolom.',
        path: ['confirmPassword']
      }
    ),
    handler: async ({ userName, role, password }, { cookies }) => {
      try {
        // hash password and insert new user to database, returning its id
        const passwordHash = await hashPassword({ password })
        await db.insert(userTable).values({ userName, role, passwordHash })

        // autologin mechanism
        const [user] = await db
          .select({ id: userTable.id, userName: userTable.userName })
          .from(userTable)
          .where(eq(userTable.userName, userName))

        if (user) {
          const token = generateSessionToken()
          const session = await createSession({ token, userId: user.id })
          setSessionTokenCookie({ cookies, token, expires: session.expiresAt })
        }
      } catch (error) {
        if (error instanceof Error) {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          })
        } else {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Telah terjadi kerusakan yang tidak diketahui.'
          })
        }
      }
    }
  }),

  login: defineAction({
    accept: 'form',
    input: insertUserSchema.pick({ userName: true, password: true }),
    handler: async ({ userName, password }, { cookies }) => {
      try {
        const InvalidUsernameAndOrPassword = new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Username dan/atau password yang anda masukkan salah.'
        })
        const [user] = await db
          .select()
          .from(userTable)
          .where(eq(userTable.userName, userName))
        if (!user) {
          throw InvalidUsernameAndOrPassword
        }

        const isPasswordValid = await verifyPassword({
          password,
          hash: user.passwordHash!
        })
        if (!isPasswordValid) {
          throw InvalidUsernameAndOrPassword
        }

        const token = generateSessionToken()
        const session = await createSession({ token, userId: user.id })
        setSessionTokenCookie({ cookies, token, expires: session.expiresAt })
      } catch (error) {
        if (error instanceof Error) {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          })
        } else {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Telah terjadi kerusakan yang tidak diketahui.'
          })
        }
      }
    }
  }),

  logout: defineAction({
    handler: async (_, { cookies }) => {
      try {
        const token = cookies.get(COOKIE_NAME)?.value ?? null
        if (!token) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message:
              'Cookie token tidak ditemukan -- operasi tidak dapat dilanjutkan.'
          })
        }

        const { session } = await validateSessionToken({ token })
        if (session) {
          await invalidateSession({ sessionId: session.id })
        }

        deleteSessionTokenCookie({ cookies })
      } catch (error) {
        if (error instanceof Error) {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          })
        } else {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Telah terjadi kerusakan yang tidak diketahui.'
          })
        }
      }
    }
  })
}
