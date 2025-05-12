import { defineAction, ActionError } from 'astro:actions'
import { getSettings, getMenu } from '~/db/queries/settings'

const settings = {
  get: defineAction({
    handler: async () => {
      try {
        return await getSettings()
      } catch (error) {
        console.log(error)
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Terjadi masalah di server kami.'
        })
      }
    }
  }),

  // menu specific action
  menu: {
    get: defineAction({
      handler: async () => {
        try {
          return await getMenu()
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
}

export default settings
