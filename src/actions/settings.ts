import { defineAction, ActionError } from 'astro:actions'
import { db } from '~/db/db'
import { settingsTable } from '~/db/schema/site'

const settings = {
  get: defineAction({
    handler: async () => {
      try {
        return await getSettingsSQL.execute()
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

export default settings

// prepared SQLs

const getSettingsSQL = db.select().from(settingsTable).prepare()
