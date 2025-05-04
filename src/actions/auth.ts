import { defineAction, ActionError } from 'astro:actions'
import { userTable } from '~/db/schema/auth'
import { userProfileTable } from '~/db/schema/user'
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

export const insertUserSchema = createInsertSchema(userTable, {
  userName: (sch) =>
    sch.min(4, 'Username harus terdiri dari setidaknya empat karakter')
}).extend({
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
    handler: async ({ userName, role = 'USER', password }, { cookies }) => {
      try {
        const user = await db.transaction(async (tx) => {
          // hash password and insert new user to database, returning its id
          const passwordHash = await hashPassword({ password })
          const [user] = await tx
            .insert(userTable)
            .values({ userName, role, passwordHash })
            .$returningId()
          if (user) {
            // also populate user profile table
            await tx
              .insert(userProfileTable)
              .values({ userId: user.id, fullName: userName })

            return user
          } else {
            tx.rollback()
            return null
          }
        })

        if (user) {
          // do autologin
          const token = generateSessionToken()
          const session = await createSession({ token, userId: user.id })
          setSessionTokenCookie({
            cookies,
            token,
            expires: session.expiresAt
          })
        }
      } catch (error) {
        if (error instanceof Error) {
          // @ts-ignore
          if (error.code === 'ER_DUP_ENTRY') {
            throw new ActionError({
              code: 'FORBIDDEN',
              message: 'Username telah terdaftar.'
            })
          } else {
            console.log(error.message)
            throw new ActionError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Terjadi kesalahan internal: ${error.cause}`
            })
          }
        } else {
          console.log(error)
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
  }),

  isUserEmpty: defineAction({
    handler: async () => {
      const admins = await db.query.userTable.findFirst({
        where: (c) => eq(c.role, 'ADMINISTRATOR')
      })

      return !admins
    }
  })
}
