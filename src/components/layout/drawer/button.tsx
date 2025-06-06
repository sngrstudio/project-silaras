/**
 * @fileoverview Drawer Toggle Button Component
 *
 * React component providing a toggle button for the navigation drawer (sidebar).
 * Manages the open/close state of the mobile navigation menu with proper
 * accessibility support and responsive design considerations.
 *
 * Features:
 * - Toggle drawer open/close state
 * - Nanostore integration for state management
 * - Accessible button with proper ARIA labels
 * - Ghost button styling for clean UI
 * - Menu icon from Lucide icon set
 * - Responsive design support
 *
 * State Management:
 * - Uses $openDrawer nanostore for reactive state
 * - setOpenDrawer function for state updates
 * - Automatic UI updates on state changes
 *
 * Accessibility:
 * - Proper aria-label for screen readers
 * - Keyboard navigation support
 * - Focus management
 * - Semantic button element
 *
 * Usage:
 * ```tsx
 * <DrawerButtonRC />
 * ```
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

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
