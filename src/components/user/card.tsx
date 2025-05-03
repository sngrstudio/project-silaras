import type { FC, PropsWithChildren } from 'react'
import ToastWrapper from '../toast/toast'

export interface UserLoginSignupCardProps {
  title: string
}

const UserLoginSignupCard: FC<PropsWithChildren<UserLoginSignupCardProps>> = ({
  title,
  children
}) => {
  return (
    <ToastWrapper>
      {/* main card wrapper */}
      <div className='card border-base-300 min-w-[360px] border'>
        <div className='card-body'>
          <h1 className='card-title mb-6 justify-center text-center'>
            {title}
          </h1>
          {children}
        </div>
      </div>
    </ToastWrapper>
  )
}

export default UserLoginSignupCard
