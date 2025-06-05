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
    <ul className='menu bg-base-200/95 border-primary/70 pointer-coarse:menu-lg relative z-[9997] h-full w-64 border-r-2 p-4 backdrop-blur-sm max-xl:pt-[4rem] max-md:pointer-coarse:w-[80vw]'>
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
        <a
          href='/'
          className='group hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
        >
          <HomeIcon className='h-5 w-5 transition-colors duration-200' />
          <span className='font-medium'>Beranda</span>
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
      <li className='menu-title text-primary/70 mt-6 mb-2 text-xs font-bold tracking-wide uppercase'>
        Tautan Cepat
      </li>
      {/* Admin gets link to main kabupaten */}
      {user.accessLevel >= 4 && (
        <li>
          <a
            href='/region/kotawaringin-timur-6202'
            className='group hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
          >
            <MapIcon className='h-5 w-5 transition-colors duration-200' />
            <span className='font-medium'>Kotawaringin Timur</span>
          </a>
        </li>
      )}
      {/* Users with region assignment get quick link to their region */}
      {user.regionId && user.accessLevel < 4 && (
        <li>
          <a
            href='/'
            className='group hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
          >
            <MapIcon className='h-5 w-5 transition-colors duration-200' />
            <span className='font-medium'>Wilayah Saya</span>
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
      <li className='menu-title text-primary/70 mt-6 mb-2 text-xs font-bold tracking-wide uppercase'>
        Pengaturan Aplikasi
      </li>
      {availableMenuItems.map((item, i) => {
        const IconComponent = item.icon
        return (
          <li key={i}>
            <a
              href={item.href}
              className='group hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
            >
              <IconComponent className='h-5 w-5 transition-colors duration-200' />
              <span className='font-medium'>{item.label}</span>
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
      <li className='menu-title text-primary/70 mt-auto mb-2 text-xs font-bold tracking-wide uppercase'>
        {user.fullName}
      </li>
      <li>
        <a
          href='/user/profile'
          className='group hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
        >
          <UserIcon className='h-5 w-5 transition-colors duration-200' />
          <span className='font-medium'>Profil Pengguna</span>
        </a>
      </li>
      <li>
        <div
          role='button'
          onClick={handleLogout}
          className='group hover:border-error/30 hover:bg-error/10 hover:text-error flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
        >
          <LogOutIcon className='h-5 w-5 transition-colors duration-200' />
          <span className='font-medium'>Logout</span>
        </div>
      </li>
    </>
  )
}
