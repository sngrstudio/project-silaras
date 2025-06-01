import type { FC } from 'react'
import { useStore } from '@nanostores/react'
import { $currentUser, setCurrentUser } from './drawer.store'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

const SETTINGS_MENU = [
  {
    label: 'Setelan Situs',
    href: '/settings/site'
  },
  {
    label: 'Setelan Menu',
    href: '/settings/menu'
  },
  {
    label: 'Manajemen Pengguna',
    href: '/settings/users'
  }
]

const DrawerMenuRC: FC = () => {
  return (
    <ul className='menu bg-base-200 h-full w-64 p-4 max-xl:pt-[4rem]'>
      <MainMenu />
      <RegionsMenu />
      <SettingsMenu />
      <UserMenu />
    </ul>
  )
}

export default DrawerMenuRC

const MainMenu: FC = () => {
  return (
    <>
      <li>
        <a href='/'>Beranda</a>
      </li>
    </>
  )
}

const RegionsMenu: FC = () => {
  const user = useStore($currentUser)

  if (!user) {
    return <></>
  }

  // Viewers are restricted for now
  if (user.accessLevel === 1) {
    return <></>
  }

  return (
    <>
      <li className='menu-title mt-4 uppercase'>Tautan Cepat</li>
      {/* Admin gets link to main kabupaten */}
      {user.accessLevel >= 4 && (
        <li>
          <a href='/region/kotawaringin-timur-6202'>Kotawaringin Timur</a>
        </li>
      )}
      {/* Users with region assignment get quick link to their region */}
      {user.regionId && user.accessLevel < 4 && (
        <li>
          <a href='/'>Wilayah Saya</a>
        </li>
      )}
    </>
  )
}

const SettingsMenu: FC = () => {
  const user = useStore($currentUser)

  if (!user) {
    return <></>
  }

  // Filter menu items based on user access level
  const availableMenuItems = SETTINGS_MENU.filter((item) => {
    // User settings accessible to coordinators (level 3) and above
    if (item.href === '/settings/users') {
      return user.accessLevel >= 3
    }

    // Site and menu settings only for admins (level 4)
    if (item.href === '/settings/site' || item.href === '/settings/menu') {
      return user.accessLevel >= 4
    }

    return false
  })

  // Don't show settings section if user has no access to any settings
  if (availableMenuItems.length === 0) {
    return <></>
  }

  return (
    <>
      {/* Pengaturan Aplikasi */}
      <li className='menu-title mt-4 uppercase'>Pengaturan Aplikasi</li>
      {availableMenuItems.map((item, i) => (
        <li key={i}>
          <a href={item.href}>{item.label}</a>
        </li>
      ))}
    </>
  )
}

const UserMenu: FC = () => {
  const user = useStore($currentUser)

  const handleLogout = async () => {
    await actions.user.auth.logout.orThrow()
    setCurrentUser(undefined)
    navigate('/')
  }

  if (!user) {
    return <></>
  }

  return (
    <>
      <li className='menu-title mt-auto uppercase'>{user.fullName}</li>
      <li>
        <a href='/user/profile'>Profil Pengguna</a>
      </li>
      <li>
        <div role='button' onClick={handleLogout}>
          Logout
        </div>
      </li>
    </>
  )
}
