import type { FC, PropsWithChildren } from 'react'
import type { Site } from './navigation.astro'

const NavigationRC: FC<PropsWithChildren<{ site: Site }>> = ({
  children,
  site
}) => {
  return (
    <nav className='navbar border-base-300 border-b'>
      <div className='xl:hidden'>{children}</div>
      <div className='flex-1'>
        <a className='btn btn-ghost text-lg' href='/'>
          <span>{site.SITE_NAME}</span>
        </a>
      </div>
    </nav>
  )
}

export default NavigationRC
