import { defineAction, ActionError } from 'astro:actions'
import { settingsTable } from '~/db/schema/site'
import { db } from '~/db/db'
import { eq } from 'drizzle-orm'
import { z } from 'astro:schema'

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
  }),

  set: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().optional(),
      description: z.string().optional()
    }),
    handler: async ({ name, description }, { locals }) => {
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

        const updateSiteNameSql = db
          .update(settingsTable)
          .set({
            property: 'SITE_NAME',
            value: name
          })
          .where(eq(settingsTable.property, 'SITE_NAME'))
          .prepare()

        const updateSiteDescriptionSql = db
          .update(settingsTable)
          .set({
            property: 'SITE_DESCRIPTION',
            value: description
          })
          .where(eq(settingsTable.property, 'SITE_DESCRIPTION'))
          .prepare()

        const settings = await db.transaction(async () => {
          if (name) {
            updateSiteNameSql.execute()
          }

          if (description) {
            updateSiteDescriptionSql.execute()
          }

          const settings = await getSettingsSql.execute()
          return settings
        })

        if (!settings) {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Terjadi masalah saat memperbarui pengaturan.'
          })
        }

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
}
