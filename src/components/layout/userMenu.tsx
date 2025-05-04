import type { FC } from 'react'
import { DropdownMenu, Avatar } from 'radix-ui'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import { $showToast, $toastMessage } from '../toast/store'
import LogoutIcon from '~icons/lucide/log-out'

const UserMenu: FC<{}> = ({}) => {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <div tabIndex={0} role='button' className='btn btn-circle btn-ghost'>
          <UserAvatar name='Dashat Kotim' />
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='end'
          sideOffset={8}
          alignOffset={10}
          asChild
        >
          <ul
            tabIndex={0}
            className='menu bg-base-100 border-base-300 w-[180px] border *:cursor-pointer'
          >
            <DropdownMenu.Label asChild>
              <span className='menu-title text-sm uppercase'>
                Menu Pengguna
              </span>
            </DropdownMenu.Label>
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

export default UserMenu

const UserAvatar: FC<{ name: string }> = ({ name }) => {
  const extractInitials = (name: string): string =>
    ((w: string[] = name.trim().split(/\s+/)) =>
      w[0]
        ? w.length < 2
          ? w[0].slice(0, 2)
          : w
              .slice(0, 2)
              .map((s) => s[0])
              .join('')
        : '')().toUpperCase()

  return (
    <Avatar.Root asChild>
      <div className='avatar avatar-placeholder'>
        <Avatar.Fallback asChild>
          <div className='bg-secondary rounded-full p-2'>
            <span className='text-secondary-content'>
              {extractInitials(name)}
            </span>
          </div>
        </Avatar.Fallback>
      </div>
    </Avatar.Root>
  )
}

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
