import type { FC, PropsWithChildren } from 'react'
import DrawerMenuRC from './menu'
import { useStore } from '@nanostores/react'
import { $openDrawer, setOpenDrawer } from './drawer.store'

const DrawerRC: FC<PropsWithChildren> = ({ children }) => {
  const openDrawer = useStore($openDrawer)

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
      <div className='drawer-side xl:max-h-[calc(100dvh-4rem)]'>
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
