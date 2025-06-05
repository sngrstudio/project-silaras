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
    <div className='card border-base-300/50 bg-base-100 group hover:border-primary/30 hover:shadow-primary/5 relative overflow-hidden border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
      {/* Subtle gradient overlay for depth */}
      <div className='from-base-100/50 to-base-200/30 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

      {/* Content container */}
      <div className='card-body relative z-10'>
        {title && (
          <h2 className='card-title text-base-content group-hover:text-primary mb-4 flex items-center gap-3 transition-colors duration-200'>
            <div className='bg-primary/10 border-primary/20 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300 group-hover:scale-110'>
              <div className='bg-primary h-2 w-2 rounded-full transition-all duration-300 group-hover:h-3 group-hover:w-3' />
            </div>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}

export default CardTemplate
