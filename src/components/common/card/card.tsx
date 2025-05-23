import type { FC, PropsWithChildren } from 'react'

interface CardTemplateProps {
  title?: string | undefined
}

/**
 * CardTemplate component
 *
 * A reusable card layout for wrapping content in a styled card UI.
 *
 * Props:
 * - title (optional): string | undefined — If provided, displays as the card's heading.
 * - children: ReactNode — The content to render inside the card body.
 *
 * Usage:
 * `<CardTemplate title="My Card Title">Content here</CardTemplate>`
 */

const CardTemplate: FC<PropsWithChildren<CardTemplateProps>> = ({
  children,
  title
}) => {
  return (
    <div className='card border-base-300 border'>
      <div className='card-body'>
        {title && <h2 className='card-title'>{title}</h2>}
        {children}
      </div>
    </div>
  )
}

export default CardTemplate
