import { defineAction, ActionError } from 'astro:actions'
import { getRegions, getSpecificRegion } from '~/db/queries/region'
import { z } from 'astro:schema'

const region = {
  getAll: defineAction({
    input: z.object({
      type: z.enum(['SUBDISTRICT', 'VILLAGE']),
      page: z.number().optional(),
      size: z.number().optional()
    }),
    handler: async (input, ctx) => {
      const localUser = ctx.locals.user
      if (!localUser) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Operasi terbatas!'
        })
      }

      const { type, page, size } = input

      return await getRegions(type, { page, size })
    }
  }),

  get: defineAction({
    input: z.object({
      slug: z.string()
    }),
    handler: async (input, ctx) => {
      const localUser = ctx.locals.user
      if (!localUser) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Operasi terbatas!'
        })
      }

      const { slug } = input

      return await getSpecificRegion(slug)
    }
  })
}

export default region
