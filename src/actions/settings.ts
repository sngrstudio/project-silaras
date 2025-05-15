import { defineAction } from 'astro:actions'
import { getSettings, updateSettings, getMenu } from '~/db/queries/settings'
import { deletePresignedImage } from '~/db/queries/image'
import { s3 } from '~/lib/s3'
import { write } from 'bun'
import { z } from 'astro:schema'

const settings = {
  get: defineAction({
    handler: async () => {
      return await getSettings()
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

        const fileExt = logoFile.name.substring(logoFile.name.lastIndexOf('.'))
        const fileName = `logo-${Bun.randomUUIDv7()}${fileExt}`
        const file = s3.file(fileName)

        await write(file, logoFile)
        logo = fileName
      }

      return await updateSettings({ logo, ...input })
    }
  }),

  // menu specific action
  menu: {
    get: defineAction({
      handler: async () => {
        return await getMenu()
      }
    })
  }
}

export default settings
