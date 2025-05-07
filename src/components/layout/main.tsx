import type { FC, PropsWithChildren } from 'react'
import { ScrollArea } from 'radix-ui'

const Main: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ScrollArea.Root asChild>
      <main className='max-h-[calc(100vh-4rem)] flex-1 overflow-y-hidden'>
        <ScrollArea.Viewport className='h-full w-full p-4 lg:p-6'>
          {children}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation='vertical'>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </main>
    </ScrollArea.Root>
  )
}

export default Main
