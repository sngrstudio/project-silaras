import type { FC } from 'react'
import { useStore } from '@nanostores/react'
import { $openDrawer, setOpenDrawer } from './drawer.store'
import MenuIcon from '~icons/lucide/menu'

/**
 * DrawerButtonRC
 *
 * A button component to toggle the sidebar (drawer) open/close state.
 *
 * - Uses a nanostore ($openDrawer) to track open/close state.
 * - On click, toggles the drawer state using setOpenDrawer.
 * - Renders a button with a menu icon and accessible label.
 *
 * Usage:
 * `<DrawerButtonRC />`
 */

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
