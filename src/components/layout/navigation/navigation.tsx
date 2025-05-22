import type { FC, PropsWithChildren } from 'react'

const NavigationRC: FC<PropsWithChildren> = ({ children }) => {
  return (
    <nav className='navbar'>
      <div className=''>{children}</div>
      <div className='flex-1'>
        <a className='btn btn-ghost text-lg' href='/'>
          SILARAS
        </a>
      </div>
    </nav>
  )
}

export default NavigationRC
