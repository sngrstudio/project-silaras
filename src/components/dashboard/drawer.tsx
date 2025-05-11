import type { FC, PropsWithChildren } from 'react'
import MainMenuRC from './menu'
import { ScrollArea } from 'radix-ui'
import { useStore } from '@nanostores/react'
import { $openDrawer, setOpenDrawer } from './store'

const DrawerRC: FC<PropsWithChildren> = ({ children }) => {
  const openDrawer = useStore($openDrawer)

  const handleSetOpenDrawer = () => {
    setOpenDrawer(!openDrawer)
  }

  return (
    <div className='drawer lg:drawer-open'>
      <input
        type='checkbox'
        id='drawer'
        className='drawer-toggle'
        checked={openDrawer}
        onChange={handleSetOpenDrawer}
      />

      <div className='drawer-content max-h-[calc(100vh-4rem)]'>
        <DrawerArea>
          <main className='mx-auto h-[calc(100vh-4rem)] max-w-screen-lg p-4 lg:p-6'>
            {children}
          </main>
        </DrawerArea>
      </div>
      <aside className='drawer-side max-h-[calc(100vh-4rem)]'>
        <label
          htmlFor='drawer'
          className='drawer-overlay'
          aria-label='close sidebar'
        />
        <DrawerArea>
          <MainMenuRC />
        </DrawerArea>
      </aside>
    </div>
  )
}

export default DrawerRC

const DrawerArea: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ScrollArea.Root>
      <ScrollArea.Viewport>{children}</ScrollArea.Viewport>
      <ScrollArea.Scrollbar>
        <ScrollArea.Thumb></ScrollArea.Thumb>
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
