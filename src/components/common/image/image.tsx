import type { FC, ImgHTMLAttributes } from 'react'
import type { GetImageResult } from 'astro'

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  image: GetImageResult
}

const Image: FC<ImageProps> = ({ image, className, ...props }) => {
  return (
    <img
      className={className}
      src={image.src}
      {...image.attributes}
      {...props}
    />
  )
}

export default Image
