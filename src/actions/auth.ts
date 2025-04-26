import { defineAction, ActionError } from 'astro:actions'
import { db } from '~/db'
import { userInsertZodSchema, userTable } from '~/db/schema/user'
import { hash, verify } from '@node-rs/argon2'
import { eq } from 'drizzle-orm'
import {
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateAllSession
} from '~/db/auth/api'
import {
  setSessionTokenCookie,
  deleteSessionTokenCookie
} from '~/db/auth/cookies'

export const auth = {
  signup: defineAction({
    input: userInsertZodSchema.refine(
      (data) => data.password === data.confirmPassword,
      {
        message: 'Passwords must match',
        path: ['confirmPassword']
      }
    ),
    handler: async ({ userName, password }) => {
      await db.transaction(async (tx) => {
        const passwordHash = await hashPassword(password)
        await tx.insert(userTable).values({ userName, passwordHash })
      })
    },
    accept: 'form'
  }),

  login: defineAction({
    input: userInsertZodSchema.pick({ userName: true, password: true }),
    handler: async ({ userName, password }, { cookies }) => {
      await db.transaction(async (tx) => {
        const UnauthorizedError = new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Username dan/atau password yang anda masukkan salah.'
        })

        const [user] = await tx
          .select()
          .from(userTable)
          .where(eq(userTable.userName, userName))
        if (!user) throw UnauthorizedError

        const isUserPasswordValid = await verifyPassword(
          user.passwordHash!,
          password
        )
        if (!isUserPasswordValid) throw UnauthorizedError

        const token = generateSessionToken()
        const session = await createSession(token, user.id)
        setSessionTokenCookie(cookies, token, session.expiresAt)
      })
    },
    accept: 'form'
  }),

  logout: defineAction({
    handler: async (_, { cookies }) => {
      const token = cookies.get('session')?.value ?? null
      if (!token) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'No session token found'
        })
      }

      const { user } = await validateSessionToken(token)
      if (!user)
        throw new ActionError({ code: 'FORBIDDEN', message: 'User not found' })

      await invalidateAllSession(user.id)
      deleteSessionTokenCookie(cookies)
    }
  })
}

const hashPassword = async (password: string) =>
  await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 2,
    parallelism: 1
  })

const verifyPassword = async (hash: string, password: string) =>
  await verify(hash, password)
