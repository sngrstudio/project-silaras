import { defineAction, ActionError } from 'astro:actions'
import { getSettings, updateSettings, getMenu } from '~/db/queries/settings'
import { deletePresignedImage } from '~/db/queries/image'
import { s3 } from '~/lib/s3'
import { write } from 'bun'
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
      description: z.string().optional(),
      logo: z.instanceof(File).optional()
    }),
    handler: async ({ logo: logoFile, ...input }) => {
      try {
        const existingSettings = await getSettings()
        let logo = undefined
        if (logoFile && logoFile.name) {
          const existingLogo = existingSettings.find(
            (p) => p.property === 'SITE_LOGO'
          )
          if (existingLogo && existingLogo.value) {
            const exFile = s3.file(existingLogo.value)
            await deletePresignedImage(existingLogo.value)
            await exFile.delete()
          }

          const fileExt = logoFile.name.substring(
            logoFile.name.lastIndexOf('.')
          )
          const fileName = `logo-${Bun.randomUUIDv7()}${fileExt}`
          const file = s3.file(fileName)

          await write(file, logoFile)
          logo = fileName
        }

        return await updateSettings({ logo, ...input })
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
