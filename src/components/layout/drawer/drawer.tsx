import type { FC, PropsWithChildren } from 'react'
import DrawerMenuRC from './menu'
import { useStore } from '@nanostores/react'
import { $openDrawer, setOpenDrawer } from './store'
import MenuIcon from '~icons/lucide/menu'

const DrawerRC: FC<PropsWithChildren> = ({ children }) => {
  const openDrawer = useStore($openDrawer)

  const handleOpenDrawer = () => {
    setOpenDrawer(!openDrawer)
  }

  return (
    <main className='drawer md:drawer-open'>
      <input
        id='drawer'
        type='checkbox'
        className='drawer-toggle'
        checked={openDrawer}
        onChange={handleOpenDrawer}
      />
      <div className='drawer-content p-4'>{children}</div>
      <div className='drawer-side'>
        <label
          htmlFor='drawer'
          className='drawer-overlay'
          aria-label='close sidebar'
        />
        <DrawerMenuRC />
      </div>
    </main>
  )
}

export default DrawerRC

export const DrawerButtonRC: FC = () => {
  return (
    <button className='btn btn-ghost btn-square' aria-label='open sidebar'>
      <MenuIcon />
    </button>
  )
}
