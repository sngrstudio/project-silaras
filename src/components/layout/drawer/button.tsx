import type { FC } from 'react'
import { useStore } from '@nanostores/react'
import { $openDrawer, setOpenDrawer } from './drawer.store'
import MenuIcon from '~icons/lucide/menu'

const DrawerButtonRC: FC = () => {
  const openDrawer = useStore($openDrawer)

  const handleOpenDrawer = () => {
    setOpenDrawer(!openDrawer)
  }

  return (
    <button
      className='btn btn-ghost btn-square'
      aria-label='open sidebar'
      onClick={handleOpenDrawer}
    >
      <MenuIcon />
    </button>
  )
}

export default DrawerButtonRC
