import type { FC, PropsWithChildren } from 'react'

const Card: FC<PropsWithChildren<{ title?: string | undefined }>> = ({
  title,
  children
}) => {
  return (
    <div className='card border border-base-300 shadow'>
      <div className='card-body'>
        {title && <h2 className='card-title mb-6'>{title}</h2>}
        {children}
      </div>
    </div>
  )
}

export default Card
