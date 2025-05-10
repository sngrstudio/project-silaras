import type { FC, PropsWithChildren } from 'react'
import { NavigationMenu as Nav } from 'radix-ui'
import { useStore } from '@nanostores/react'
import { $site, setOpenDrawer } from './store'
import MenuIcon from '~icons/lucide/menu'

const NavbarRC: FC = () => {
  const site = useStore($site)

  const handleOpenDrawer = () => {
    setOpenDrawer(true)
  }

  if (!site) {
    return <NavbarLoading />
  }

  return (
    <NavbarWrapper>
      <Nav.Item className='flex-none lg:hidden'>
        <Nav.Link asChild>
          <button
            className='btn btn-ghost btn-square'
            onClick={handleOpenDrawer}
          >
            <MenuIcon />
          </button>
        </Nav.Link>
      </Nav.Item>

      <Nav.Item className='flex-1'>
        <Nav.Link asChild>
          <a href='/' className='btn btn-ghost text-xl font-bold'>
            {site.name}
          </a>
        </Nav.Link>
      </Nav.Item>
    </NavbarWrapper>
  )
}

export default NavbarRC

const NavbarWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Nav.Root>
      <Nav.List className='navbar border-base-300 border-b'>
        {children}
      </Nav.List>
    </Nav.Root>
  )
}

const NavbarLoading: FC = () => {
  return (
    <NavbarWrapper>
      <Nav.Item className='flex-1'>
        <Nav.Link asChild>
          <div className='skeleton'></div>
        </Nav.Link>
      </Nav.Item>
    </NavbarWrapper>
  )
}
