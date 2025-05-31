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

  return (
    <>
      <li className='menu-title mt-4 uppercase'>Tautan Cepat</li>
    </>
  )
}

const SettingsMenu: FC = () => {
  return (
    <>
      {/* Pengaturan Aplikasi */}
      <li className='menu-title mt-4 uppercase'>Pengaturan Aplikasi</li>
      {SETTINGS_MENU.map((item, i) => (
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
