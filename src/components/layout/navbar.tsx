import type { FC, PropsWithChildren } from 'react'
import { NavigationMenu } from 'radix-ui'
import { useStore } from '@nanostores/react'
import { $openDrawer, setOpenDrawer } from './store'
import { $siteName } from '../pages/stores/settings'
import MenuIcon from '~icons/lucide/menu'

const Navbar: FC<PropsWithChildren> = ({ children }) => {
  const siteName = useStore($siteName)
  const openDrawer = useStore($openDrawer)

  const handleOpenDrawer = () => setOpenDrawer(!openDrawer)

  return (
    <NavigationMenu.Root>
      <NavigationMenu.List className='navbar border-base-300 border-b'>
        <NavigationMenu.Item className='flex-none lg:hidden'>
          <NavigationMenu.Link asChild>
            <button
              className='btn btn-ghost btn-square'
              onClick={handleOpenDrawer}
            >
              <MenuIcon />
            </button>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item className='flex-1'>
          <NavigationMenu.Link asChild>
            <a href='/' className='btn btn-ghost'>
              <span className='text-xl font-bold'>{siteName}</span>
            </a>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item className='flex-none'>
          <NavigationMenu.Link asChild>{children}</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}

export default Navbar
