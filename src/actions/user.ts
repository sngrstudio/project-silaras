import { defineAction, ActionError } from 'astro:actions'
import { userProfileView, userProfileTable } from '~/db/schema/user'
import { userTable } from '~/db/schema/auth'
import { db } from '~/db/db'
import { eq, sql } from 'drizzle-orm'
import { createUpdateSchema } from 'drizzle-zod'
import { z } from 'astro:schema'

const updateProfileSchema = createUpdateSchema(userProfileTable).omit({
  userId: true
})

const getProfileSql = db
  .select()
  .from(userProfileView)
  .where(eq(userProfileView.userName, sql.placeholder('userName')))
  .limit(1)
  .prepare()

export const user = {
  get: defineAction({
    input: z.object({
      userName: z.string()
    }),
    handler: async ({ userName }) => {
      try {
        const [profile] = await getProfileSql.execute({ userName })
        if (!profile) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'User tidak ditemukan.'
          })
        }

        return profile
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

  getAll: defineAction({
    handler: async (_, { locals }) => {
      try {
        const localUser = locals.user
        if (!localUser) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Silahkan log in.'
          })
        }

        if (localUser.role !== 'ADMINISTRATOR') {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Operasi khusus Administrator!'
          })
        }

        const getAllProfileSql = db.select().from(userProfileView).prepare()
        const users = await getAllProfileSql.execute()

        return users
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

  set: defineAction({
    accept: 'form',
    input: updateProfileSchema,
    handler: async (inputs, { locals }) => {
      try {
        const localUser = locals.user
        if (!localUser) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Silahkan log in.'
          })
        }

        const getUserIdSql = db
          .select({
            id: userTable.id
          })
          .from(userTable)
          .where(eq(userTable.userName, sql.placeholder('userName')))
          .limit(1)
          .prepare()

        const updateProfileSql = db
          .update(userProfileTable)
          .set(inputs)
          .where(eq(userProfileTable.userId, sql.placeholder('userId')))
          .prepare()

        const profile = await db.transaction(async (tx) => {
          const [user] = await getUserIdSql.execute({
            userName: localUser.userName
          })
          if (user) {
            await updateProfileSql.execute({ userId: user.id })
            const [newProfile] = await getProfileSql.execute({
              userName: localUser.userName
            })

            return newProfile
          } else {
            tx.rollback()
            return null
          }
        })
        if (!profile) {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Terjadi masalah saat memperbarui user.'
          })
        }

        return profile
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
