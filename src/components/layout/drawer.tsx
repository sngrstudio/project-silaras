import { type FC, type PropsWithChildren } from 'react'
import { useStore } from '@nanostores/react'
import { $openDrawer } from './store'

const Drawer: FC<PropsWithChildren> = ({ children }) => {
  const openDrawer = useStore($openDrawer)
  const handleOpenDrawer = () => $openDrawer.set(!openDrawer)

  return (
    <div className='drawer lg:drawer-open' data-open={openDrawer}>
      <input
        id='drawer'
        type='checkbox'
        className='drawer-toggle lg:hidden'
        checked={openDrawer}
        onChange={handleOpenDrawer}
      />
      <div className='drawer-content'>
        {/* Page content here */}
        <main className='p-4 lg:p-8'>{children}</main>
      </div>
      <div className='drawer-side max-h-[calc(100vh-4rem)]'>
        <label
          htmlFor='drawer'
          aria-label='close sidebar'
          className='drawer-overlay'
        ></label>
        <ul className='menu bg-base-200 text-base-content min-h-full w-80 p-4'>
          {/* Sidebar content here */}
          <li>
            <a>Sidebar Item 1</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Drawer
