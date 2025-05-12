import { defineAction, ActionError } from 'astro:actions'
import { getPresignedImage, insertPresignedImage } from '~/db/queries/image'
import { s3 } from '~/lib/s3'
import { z } from 'astro:schema'

const image = {
  presign: defineAction({
    input: z.object({
      src: z.string()
    }),
    handler: async ({ src: fileName }) => {
      try {
        const existingPresignedImage = await getPresignedImage(fileName)
        const file = s3.file(fileName)
        const expiresIn = 60 * 60

        if (existingPresignedImage) {
          if (
            Date.now() >
            existingPresignedImage.expiresAt.getTime() - 60 * 30
          ) {
            const updatedPresignedUrl = file.presign({
              expiresIn,
              acl: 'public-read'
            })
            const updatedPresignedImage = await insertPresignedImage(
              fileName,
              updatedPresignedUrl,
              new Date(Date.now() + 1000 * expiresIn)
            )
            return updatedPresignedImage.presignedUrl
          }

          return existingPresignedImage.presignedUrl
        }

        const presignedUrl = file.presign({
          expiresIn,
          acl: 'public-read'
        })

        const newPresignedImage = await insertPresignedImage(
          fileName,
          presignedUrl,
          new Date(Date.now() + 1000 * expiresIn)
        )
        return newPresignedImage.presignedUrl
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

export default image
