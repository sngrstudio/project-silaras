import type { FC, PropsWithChildren } from 'react'

export interface UserLoginSignupCardProps {
  title: string
}

const UserLoginSignupCard: FC<PropsWithChildren<UserLoginSignupCardProps>> = ({
  title,
  children
}) => {
  return (
    <div className='card border-base-300 min-w-[360px] border'>
      <div className='card-body'>
        <h1 className='card-title mb-6 justify-center text-center'>{title}</h1>
        {children}
      </div>
    </div>
  )
}

export default UserLoginSignupCard
