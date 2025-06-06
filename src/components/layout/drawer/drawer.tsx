/**
 * @fileoverview Main Drawer Navigation Component
 *
 * Core React component implementing the responsive drawer/sidebar navigation
 * system for the SILARAS application. Provides desktop and mobile navigation
 * with proper state management and user context integration.
 *
 * Features:
 * - Responsive drawer layout (mobile overlay, desktop sidebar)
 * - User authentication state management
 * - Hydration-safe user data handling
 * - Automatic content scrolling and overflow management
 * - Accessible navigation with proper ARIA attributes
 * - Integration with DaisyUI drawer component
 *
 * Layout Structure:
 * - Desktop: Persistent sidebar (xl:drawer-open)
 * - Mobile: Overlay drawer triggered by toggle
 * - Content area with proper height calculations
 * - Sidebar menu with navigation items
 *
 * State Management:
 * - Uses nanostore for reactive drawer state
 * - Manages current user data across components
 * - Prevents hydration mismatches with useEffect
 * - Syncs user state from SSR to client
 *
 * User Context:
 * - Receives user data from Astro.locals via SSR
 * - Updates global user state for navigation menu
 * - Handles authentication state changes
 * - Provides user context to child components
 *
 * Accessibility:
 * - Proper checkbox input for drawer toggle
 * - Semantic main element structure
 * - Focus management for navigation
 * - Screen reader compatible labels
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

import type { FC, PropsWithChildren } from 'react'
import { useEffect } from 'react'
import DrawerMenuRC from './menu'
import { useStore } from '@nanostores/react'
import { $openDrawer, setOpenDrawer, setCurrentUser } from './drawer.store'

interface DrawerProps extends PropsWithChildren {
  user?: any // User from Astro.locals
}

const DrawerRC: FC<DrawerProps> = ({ children, user }) => {
  const openDrawer = useStore($openDrawer)

  // Set user data immediately to prevent hydration mismatch
  useEffect(() => {
    if (user) {
      setCurrentUser(user)
    } else {
      setCurrentUser(undefined)
    }
  }, [user])

  const handleOpenDrawer = () => {
    setOpenDrawer(!openDrawer)
  }

  return (
    <main className='drawer xl:drawer-open'>
      <input
        id='drawer'
        type='checkbox'
        className='drawer-toggle'
        checked={openDrawer}
        onChange={handleOpenDrawer}
      />
      <div className='drawer-content h-[calc(100vh-4rem)] overflow-auto p-4 md:p-8'>
        {children}
      </div>
      <div className='drawer-side z-[9997] xl:max-h-[calc(100dvh-4rem)]'>
        <label
          htmlFor='drawer'
          className='drawer-overlay z-[9997]'
          aria-label='close sidebar'
        />
        <DrawerMenuRC />
      </div>
    </main>
  )
}

export default DrawerRC
