import type { FC, PropsWithChildren } from 'react'
import { DrawerMenu } from './drawer-components'
import { useStore } from '@nanostores/react'
import { $openDrawer, setOpenDrawer } from './store'

const Drawer: FC<PropsWithChildren> = ({ children }) => {
  const openDrawer = useStore($openDrawer)
  const handleOpenDrawer = () => setOpenDrawer(!openDrawer)

  return (
    <div className='drawer lg:drawer-open' data-open={openDrawer}>
      <input
        id='drawer'
        type='checkbox'
        className='drawer-toggle'
        checked={openDrawer}
        onChange={handleOpenDrawer}
      />
      <div className='drawer-content flex flex-col'>
        {/* Content */}
        {children}
      </div>
      <div className='drawer-side lg:max-h-[calc(100vh-4rem)]'>
        <label
          htmlFor='drawer'
          aria-label='close sidebar'
          className='drawer-overlay'
        ></label>
        <DrawerMenu />
      </div>
    </div>
  )
}

export default Drawer
