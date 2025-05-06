import type { FC, PropsWithChildren } from 'react'

const CardTemplate: FC<PropsWithChildren<{ title?: string | undefined }>> = ({
  title,
  children
}) => {
  return (
    <article className='card border-base-300 focus:border-primary border shadow'>
      <div className='card-body'>
        {title && <h2 className='card-title mb-4'>{title}</h2>}

        {children}
      </div>
    </article>
  )
}

export default CardTemplate
