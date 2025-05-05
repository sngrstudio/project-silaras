import { defineAction, ActionError } from 'astro:actions'
import { userProfileView } from '~/db/schema/user'
import { db } from '~/db/db'
import { eq } from 'drizzle-orm'
import { z } from 'astro:schema'

export const user = {
  get: defineAction({
    input: z.object({
      userName: z.string()
    }),
    handler: async ({ userName }) => {
      try {
        const sql = db
          .select({
            fullName: userProfileView.fullName,
            userName: userProfileView.userName,
            role: userProfileView.role
          })
          .from(userProfileView)
          .where(eq(userProfileView.userName, userName))
          .limit(1)
          .prepare()

        const [profile] = await sql.execute()
        if (!profile) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Terjadi masalah saat mengambil user.'
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
