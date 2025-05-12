import { defineAction, ActionError } from 'astro:actions'
import { getSettings, updateSettings, getMenu } from '~/db/queries/settings'
import { z } from 'astro:schema'

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

  update: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().optional(),
      description: z.string().optional()
    }),
    handler: async (input) => {
      try {
        return await updateSettings(input)
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
