import { defineAction, ActionError } from 'astro:actions'
import { settingsTable } from '~/db/schema/site'
import { db } from '~/db/db'

const getSettingsSql = db.select().from(settingsTable).prepare()

export const settings = {
  get: defineAction({
    handler: async () => {
      try {
        const settings = await getSettingsSql.execute()
        return settings
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

  // set: defineAction({
  //   accept: 'form',
  //   input: updateProfileSchema,
  //   handler: async (inputs, { locals }) => {
  //     try {
  //       const localUser = locals.user
  //       if (!localUser) {
  //         throw new ActionError({
  //           code: 'FORBIDDEN',
  //           message: 'Silahkan log in.'
  //         })
  //       }

  //       const getUserIdSql = db
  //         .select({
  //           id: userTable.id
  //         })
  //         .from(userTable)
  //         .where(eq(userTable.userName, sql.placeholder('userName')))
  //         .limit(1)
  //         .prepare()

  //       const updateProfileSql = db
  //         .update(userProfileTable)
  //         .set(inputs)
  //         .where(eq(userProfileTable.userId, sql.placeholder('userId')))
  //         .prepare()

  //       const profile = await db.transaction(async (tx) => {
  //         const [user] = await getUserIdSql.execute({
  //           userName: localUser.userName
  //         })
  //         if (user) {
  //           await updateProfileSql.execute({ userId: user.id })
  //           const [newProfile] = await getProfileSql.execute({
  //             userName: localUser.userName
  //           })

  //           return newProfile
  //         } else {
  //           tx.rollback()
  //           return null
  //         }
  //       })
  //       if (!profile) {
  //         throw new ActionError({
  //           code: 'INTERNAL_SERVER_ERROR',
  //           message: 'Terjadi masalah saat memperbarui user.'
  //         })
  //       }

  //       return profile
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         throw new ActionError({
  //           code: 'INTERNAL_SERVER_ERROR',
  //           message: error.message
  //         })
  //       } else {
  //         throw new ActionError({
  //           code: 'INTERNAL_SERVER_ERROR',
  //           message: 'Telah terjadi kerusakan yang tidak diketahui.'
  //         })
  //       }
  //     }
  //   }
  // })
}
