import { defineAction, ActionError } from 'astro:actions'
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
import {
  getAllUsers,
  getUserByUserName,
  getCoreUser,
  getAccessLevels,
  createUser,
  deleteUser,
  createUserInputSchema
} from '~/db/queries/user'
import { deletePresignedImage } from '~/db/queries/image'
import { s3 } from '~/lib/s3'
import { write } from 'bun'
import { z } from 'astro:schema'

// input schemas
const createUserSchema = createUserInputSchema
  .omit({ passwordHash: true })
  .extend({
    profilePhoto: z.instanceof(File).optional(),
    password: z
      .string()
      .min(8, 'Password minimal sepanjang 8 karakter atau lebih.')
      .optional(),
    confirmPassword: z.string().optional(),
    createMode: z.boolean().optional()
  })

const loginSchema = createUserSchema
  .pick({ userName: true, password: true })
  .extend({ password: z.string() })

const user = {
  create: defineAction({
    accept: 'form',
    input: createUserSchema.refine(
      ({ password, confirmPassword }) => password === confirmPassword,
      {
        message: 'Password harus sama di kedua kolom.',
        path: ['confirmPassword']
      }
    ),
    handler: async (input) => {
      const {
        password,
        confirmPassword,
        createMode,
        profilePhoto: profilePhotoFile,
        ...createUserInput
      } = input

      const currentUser = (await getUserByUserName(input.userName)) ?? undefined
      let passwordHash: string | undefined = undefined
      let profilePhoto: string | undefined = undefined

      if (createMode && password && confirmPassword) {
        passwordHash = await hashPassword(password)
      }

      if (profilePhotoFile && profilePhotoFile.name) {
        if (currentUser && currentUser.profilePhoto) {
          const old = s3.file(currentUser.profilePhoto)
          await deletePresignedImage(currentUser.profilePhoto)
          await old.delete()
        }

        const fileExt = profilePhotoFile.name.substring(
          profilePhotoFile.name.lastIndexOf('.')
        )
        const fileName = `user-${input.userName}-${Bun.randomUUIDv7()}${fileExt}`
        const file = s3.file(fileName)

        await write(file, profilePhotoFile)
        profilePhoto = fileName
      }

      return await createUser(
        {
          passwordHash,
          profilePhoto,
          ...createUserInput
        },
        currentUser
      )
    }
  }),

  getCurrent: defineAction({
    handler: async (_, ctx) => {
      const localUser = ctx.locals.user
      if (!localUser) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Operasi terbatas!'
        })
      }

      return localUser
    }
  }),

  getAll: defineAction({
    handler: async (_, ctx) => {
      const localUser = ctx.locals.user
      if (!localUser || (localUser && localUser.accessLevel < 3)) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Operasi terbatas!'
        })
      }

      return await getAllUsers()
    }
  }),

  delete: defineAction({
    input: z.object({
      userName: z.string()
    }),
    handler: async (input, ctx) => {
      const localUser = ctx.locals.user
      if (!localUser || (localUser && localUser.accessLevel < 3)) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Operasi terbatas!'
        })
      }

      const user = await getUserByUserName(input.userName)
      if (!user) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'User tidak ditemukan!'
        })
      }

      if (user.profilePhoto) {
        const file = s3.file(user.profilePhoto)
        await deletePresignedImage(user.profilePhoto)

        await file.delete()
      }

      await deleteUser(user.userName)
    }
  }),

  auth: {
    login: defineAction({
      accept: 'form',
      input: loginSchema,
      handler: async ({ userName, password }, ctx) => {
        const InvalidUsernameAndOrPassword = new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Username dan/atau password yang anda masukkan salah.'
        })

        // get the user and test if user is exist
        const user = await getCoreUser(userName)
        if (!user) {
          throw InvalidUsernameAndOrPassword
        }

        // check password
        const isPasswordValid = await verifyPassword(
          password,
          user.passwordHash!
        )
        if (!isPasswordValid) {
          throw InvalidUsernameAndOrPassword
        }

        // proceed to login
        const token = generateSessionToken()
        const session = await createSession(token, user.id)
        setSessionTokenCookie(ctx, token, session.expiresAt)
      }
    }),

    logout: defineAction({
      handler: async (_, ctx) => {
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
      }
    })
  },

  accessLevels: {
    get: defineAction({
      handler: async () => {
        return await getAccessLevels()
      }
    })
  },

  checks: {
    isUserEmpty: defineAction({
      handler: async () => {
        const users = await getAllUsers()

        if (users.length < 1) {
          return true
        } else {
          return false
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
