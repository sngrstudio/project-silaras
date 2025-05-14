import {
  type FC,
  type ImgHTMLAttributes,
  type CSSProperties,
  useTransition,
  useActionState,
  useEffect
} from 'react'
import { actions } from 'astro:actions'
import clsx from 'clsx/lite'

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
}

const Image: FC<ImageProps> = ({
  src,
  width,
  height,
  alt,
  className,
  ...props
}) => {
  const [isTransitioning, startTransition] = useTransition()

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
    startTransition(() => {
      actionDispatch({ src, width, height })
    })
  }, [src])

  if (isPending || isTransitioning || !image) {
    return <></>
  }

  return (
    <img
      src={image.src}
      alt={alt}
      srcSet={image.srcSet.attribute}
      {...props}
      {...image.attributes}
      className={clsx('h-(--h) w-(--w)', className)}
      style={
        {
          '--w': `${image.options.width}px`,
          '--h': `${image.options.height}px`
        } as CSSProperties
      }
    />
  )
}

export default Image
