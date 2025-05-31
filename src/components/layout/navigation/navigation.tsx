import type { FC, PropsWithChildren } from 'react'
import type { Site } from './navigation.astro'
import type { GetImageResult } from 'astro'
import Image from '~/components/common/image/image'

const NavigationRC: FC<
  PropsWithChildren<{ site: Site; logo?: GetImageResult | undefined }>
> = ({ children, site, logo }) => {
  return (
    <nav className='navbar border-base-300 border-b'>
      <div className='xl:hidden'>{children}</div>
      <div className='flex-1'>
        <a className='btn btn-ghost text-lg' href='/'>
          {logo ? (
            <Image
              image={logo}
              className='h-[35px] w-[35px] object-contain'
              width={35}
              height={35}
              alt='site logo'
            />
          ) : null}
          <span>{site.SITE_NAME}</span>
        </a>
      </div>
    </nav>
  )
}

export default NavigationRC
