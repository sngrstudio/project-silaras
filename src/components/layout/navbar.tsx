import type { FC } from 'react'
import UserMenu from './userMenu'
import { useStore } from '@nanostores/react'
import { $openDrawer } from './store'
import MenuIcon from '~icons/lucide/menu'

interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
  const openDrawer = useStore($openDrawer)
  const handleOpenDrawer = () => $openDrawer.set(!openDrawer)

  return (
    <nav className='navbar border-base-300 border-b'>
      <div className='flex-none lg:hidden'>
        <button className='btn btn-ghost' onClick={handleOpenDrawer}>
          <MenuIcon />
        </button>
      </div>
      <div className='flex-1'>
        <a href='/' className='btn btn-ghost'>
          <span className='text-xl font-bold'>Dashat Kotim</span>
        </a>
      </div>
      <div className='flex-none px-2'>
        <UserMenu />
      </div>
    </nav>
  )
}

export default Navbar
