import type { FC, PropsWithChildren } from 'react'

interface UserLayoutProps {
  title: string
}

const UserLayoutRC: FC<PropsWithChildren<UserLayoutProps>> = ({
  children,
  title
}) => {
  return (
    <main className='bg-base-200 grid min-h-screen min-w-screen place-items-center p-4'>
      <div className='card border-base-300 bg-base-100 h-max w-full border shadow sm:w-[420px]'>
        <div className='card-body items-center justify-center'>
          <h1 className='card-title mb-6 text-center text-2xl'>{title}</h1>

          {children}
        </div>
      </div>
    </main>
  )
}

export default UserLayoutRC
