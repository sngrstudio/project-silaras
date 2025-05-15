import type { FC } from 'react'
import { NavigationMenu as Nav } from 'radix-ui'
import { useStore } from '@nanostores/react'
import { $menu } from './store'
import { actions } from 'astro:actions'
import { $showToast, setToastMessage } from '../toast/store'
import { $user } from '~/components/pages/profile/store'
import { navigate } from 'astro:transitions/client'

const MainMenuRC: FC = () => {
  const menu = useStore($menu)
  const showToast = useStore($showToast)
  const user = useStore($user)

  if (!menu || !user) {
    return (
      <div className='bg-base-200 grid h-[calc(100vh-4rem)] w-[320px] place-content-center p-4 lg:w-[240px]'>
        <div className='loading loading-dots text-base-content/20'></div>
      </div>
    )
  }

  const rootMenu = menu.filter((m) => !m.category)
  const adminMenu = menu.filter((m) => m.category === 'Administrasi')
  const userMenu = menu.filter((m) => m.category === 'Pengguna')

  const handleLogout = async () => {
    const { error } = await actions.user.auth.logout()
    if (error) {
      setToastMessage({
        error: true,
        message: error.message
      })
    }

    setToastMessage({
      message: 'Mengeluarkan Anda...'
    })
    if (!showToast) {
      navigate('/')
    }
  }

  return (
    <Nav.Root orientation='vertical'>
      <Nav.List className='menu bg-base-200 text-base-content h-[calc(100vh-4rem)] min-h-full w-[320px] p-4 lg:w-[240px]'>
        {rootMenu.map((item) => (
          <Nav.Item key={item.id}>
            <Nav.Link asChild>
              <a href={item.path}>{item.label}</a>
            </Nav.Link>
          </Nav.Item>
        ))}

        {adminMenu.some(
          (item) => (item.accessLevel || 1) <= user.accessLevel
        ) && (
          <Nav.Item className='menu-title mt-4 uppercase'>
            Menu Administrasi
          </Nav.Item>
        )}
        {adminMenu.map((item) => (
          <Nav.Item
            className='data-[hidden=true]:hidden'
            key={item.id}
            data-hidden={(item.accessLevel || 1) > user.accessLevel}
          >
            <Nav.Link asChild>
              <a href={item.path}>{item.label}</a>
            </Nav.Link>
          </Nav.Item>
        ))}

        {userMenu.some(
          (item) => (item.accessLevel || 1) <= user.accessLevel
        ) && (
          <Nav.Item className='menu-title mt-auto uppercase'>
            Menu Pengguna
          </Nav.Item>
        )}
        {userMenu.map((item) => (
          <Nav.Item
            className='data-[hidden=true]:hidden'
            key={item.id}
            data-hidden={(item.accessLevel || 1) > user.accessLevel}
          >
            <Nav.Link asChild>
              <a href={item.path}>{item.label}</a>
            </Nav.Link>
          </Nav.Item>
        ))}

        <Nav.Item>
          <button onClick={handleLogout}>Logout</button>
        </Nav.Item>
      </Nav.List>
    </Nav.Root>
  )
}

export default MainMenuRC
