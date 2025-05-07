import { type FC, useState, useEffect } from 'react'
import { ScrollArea, NavigationMenu } from 'radix-ui'
import { useStore } from '@nanostores/react'
import { $userProfile } from './store'

export const DrawerMenu: FC = () => {
  const userProfile = useStore($userProfile)
  const [path, setPath] = useState<string>('')

  useEffect(() => {
    setPath(window.location.pathname)
  }, [])

  return (
    <ScrollArea.Root className='bg-base-200 min-h-full w-64'>
      <ScrollArea.Viewport>
        <NavigationMenu.Root orientation='vertical'>
          <NavigationMenu.List className='menu w-full'>
            {/* Beranda */}
            <NavigationMenu.Item>
              <NavigationMenu.Link
                href='/'
                className={path === '/' ? 'menu-active' : ''}
              >
                Beranda
              </NavigationMenu.Link>
            </NavigationMenu.Item>

            {/* Pengaturan Umum */}
            {userProfile && userProfile.role === 'ADMINISTRATOR' && (
              <AdminOnlyMenu path={path} />
            )}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  )
}

export const AdminOnlyMenu: FC<{ path: string }> = ({ path }) => {
  return (
    <>
      <NavigationMenu.Item className='menu-title mt-6 uppercase'>
        Administrasi
      </NavigationMenu.Item>
      <NavigationMenu.Item>
        <NavigationMenu.Link
          href='/settings'
          className={path === '/settings' ? 'menu-active' : ''}
        >
          Pengaturan Umum
        </NavigationMenu.Link>
      </NavigationMenu.Item>
    </>
  )
}
