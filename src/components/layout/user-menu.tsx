import { type FC, type PropsWithChildren } from 'react'
import { DropdownMenu } from 'radix-ui'
import { $showToast, $toastMessage } from '../toast/store'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import LogoutIcon from '~icons/lucide/log-out'
import UserIcon from '~icons/lucide/user'

const UserMenuRC: FC<PropsWithChildren> = ({ children }) => {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <div tabIndex={0} role='button' className='btn btn-circle btn-ghost'>
          {children}
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content align='end' sideOffset={8} asChild>
          <ul
            tabIndex={0}
            className='menu bg-base-100 border-base-300 min-w-[180px] border shadow *:cursor-pointer'
          >
            <DropdownMenu.Label asChild>
              <span className='menu-title text-sm uppercase'>
                Menu Pengguna
              </span>
            </DropdownMenu.Label>
            <DropdownMenu.Item asChild>
              <li>
                <a href='/user/profile'>
                  <UserIcon />
                  <span>Halaman Profil</span>
                </a>
              </li>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <li>
                <LogoutButton />
              </li>
            </DropdownMenu.Item>
          </ul>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default UserMenuRC

const LogoutButton: FC = () => {
  const handleLogout = async () => {
    await actions.auth.logout()
    $showToast.set(true)
    $toastMessage.set({
      error: false,
      message: 'Sedang logout...'
    })
    $showToast.subscribe((show) => {
      if (!show) {
        navigate('/')
      }
    })
  }
  return (
    <div role='button' onClick={handleLogout}>
      <LogoutIcon />
      <span>Logout</span>
    </div>
  )
}
