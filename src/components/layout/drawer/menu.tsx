import type { FC } from 'react'
import { useStore } from '@nanostores/react'
import { $currentUser, setCurrentUser } from './drawer.store'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

// Icons
import HomeIcon from '~icons/lucide/home'
import MapIcon from '~icons/lucide/map'
import SettingsIcon from '~icons/lucide/settings'
import MenuIcon from '~icons/lucide/menu'
import UsersIcon from '~icons/lucide/users'
import UserIcon from '~icons/lucide/user'
import LogOutIcon from '~icons/lucide/log-out'

const SETTINGS_MENU = [
  {
    label: 'Setelan Situs',
    href: '/settings/site',
    icon: SettingsIcon
  },
  {
    label: 'Setelan Menu',
    href: '/settings/menu',
    icon: MenuIcon
  },
  {
    label: 'Manajemen Pengguna',
    href: '/settings/users',
    icon: UsersIcon
  }
]

const DrawerMenuRC: FC = () => {
  return (
    <ul className='menu bg-base-200 pointer-coarse:menu-lg h-full w-64 p-4 max-xl:pt-[4rem] max-md:pointer-coarse:w-[80vw]'>
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
        <a href='/'>
          <HomeIcon className='h-5 w-5' />
          Beranda
        </a>
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
          <a href='/region/kotawaringin-timur-6202'>
            <MapIcon className='h-5 w-5' />
            Kotawaringin Timur
          </a>
        </li>
      )}
      {/* Users with region assignment get quick link to their region */}
      {user.regionId && user.accessLevel < 4 && (
        <li>
          <a href='/'>
            <MapIcon className='h-5 w-5' />
            Wilayah Saya
          </a>
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
      {availableMenuItems.map((item, i) => {
        const IconComponent = item.icon
        return (
          <li key={i}>
            <a href={item.href}>
              <IconComponent className='h-5 w-5' />
              {item.label}
            </a>
          </li>
        )
      })}
    </>
  )
}

const UserMenu: FC = () => {
  const user = useStore($currentUser)

  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      return
    }

    try {
      await actions.user.auth.logout.orThrow()
      setCurrentUser(undefined)
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) {
    return <></>
  }

  return (
    <>
      <li className='menu-title mt-auto uppercase'>{user.fullName}</li>
      <li>
        <a href='/user/profile'>
          <UserIcon className='h-5 w-5' />
          Profil Pengguna
        </a>
      </li>
      <li>
        <div
          role='button'
          onClick={handleLogout}
          className='flex items-center gap-2'
        >
          <LogOutIcon className='h-5 w-5' />
          Logout
        </div>
      </li>
    </>
  )
}
