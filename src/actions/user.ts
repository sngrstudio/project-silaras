import { defineAction, ActionError } from 'astro:actions'
import { db } from '~/db/db'
import { userTable, userProfileTable } from '~/db/schema/user'
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
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'astro:schema'
import { eq, sql } from 'drizzle-orm'

// input schemas
const createSchema = z
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

const loginSchema = createSchema.pick({ userName: true, password: true })

const user = {
  create: defineAction({
    accept: 'form',
    input: createSchema.refine(
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

  // update: defineAction({
  //   handler: (_, ctx) => {}
  // }),

  // delete: defineAction({
  //   handler: (_, ctx) => {}
  // }),

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
