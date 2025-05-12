import {
  type FC,
  type ImgHTMLAttributes,
  useActionState,
  useEffect
} from 'react'
import { actions } from 'astro:actions'

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
}

const Image: FC<ImageProps> = ({ src, width, height, alt, ...props }) => {
  const handleTransformImage = async (
    _prevState: unknown,
    image: Pick<ImageProps, 'src' | 'width' | 'height'>
  ) => {
    const { src, width, height } = image
    const presigned = await actions.image.presign.orThrow({ src })
    return await actions.image.transform.orThrow({
      src: presigned,
      width: width as number,
      height: height as number
    })
  }

  const [image, actionDispatch, isPending] = useActionState(
    handleTransformImage,
    undefined
  )

  useEffect(() => {
    actionDispatch({ src, width, height })
  }, [src])

  if (isPending || !image) {
    return <></>
  }

  return (
    <img
      src={image.src}
      alt={alt}
      srcSet={image.srcSet.attribute}
      {...props}
      {...image.attributes}
    />
  )
}

export default Image
