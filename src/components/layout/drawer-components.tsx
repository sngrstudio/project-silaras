import { type FC, useState, useEffect } from 'react'
import { ScrollArea, NavigationMenu } from 'radix-ui'
import { useStore } from '@nanostores/react'
import { $userProfile } from './store'

export const DrawerMenu: FC = () => {
  const userProfile = useStore($userProfile)

  return (
    <ScrollArea.Root className='bg-base-200 min-h-full w-64'>
      <ScrollArea.Viewport>
        <NavigationMenu.Root orientation='vertical'>
          <NavigationMenu.List className='menu w-full'>
            {/* Beranda */}
            <MenuLink title='Beranda' path='/' />

            {/* Pengaturan Umum */}
            {userProfile && userProfile.role === 'ADMINISTRATOR' && (
              <AdminOnlyMenu />
            )}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation='vertical'>
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}

export const AdminOnlyMenu: FC = () => {
  return (
    <>
      <MenuLabel title='Administrasi' />
      <MenuLink title='Pengaturan Umum' path='/settings/general' />
      <MenuLink title='Pengaturan Pengguna' path='/settings/users' />
    </>
  )
}

const MenuLink: FC<{ title: string; path: string }> = ({ title, path }) => {
  const [currentPath, setCurrentPath] = useState<string>('')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  return (
    <NavigationMenu.Item>
      <NavigationMenu.Link
        href={path}
        className={currentPath === path ? 'menu-active' : ''}
      >
        {title}
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  )
}

const MenuLabel: FC<{ title: string }> = ({ title }) => {
  return (
    <NavigationMenu.Item className='menu-title mt-6 uppercase'>
      {title}
    </NavigationMenu.Item>
  )
}
