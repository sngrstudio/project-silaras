import type { FC, PropsWithChildren } from 'react'
import { Avatar } from 'radix-ui'
import { useStore } from '@nanostores/react'
import { $userProfile } from './store'

export const UserAvatar: FC<PropsWithChildren> = ({ children }) => {
  const userProfile = useStore($userProfile)

  return (
    <Avatar.Root asChild>
      <div className='avatar avatar-placeholder'>
        {children}
        <Avatar.Fallback asChild>
          <div className='bg-secondary/60 h-[40px] w-[40px] rounded-full p-2'>
            {userProfile && userProfile.fullName && (
              <span className='text-secondary-content text-xs lg:text-base'>
                {extractInitials(userProfile.fullName)}
              </span>
            )}
          </div>
        </Avatar.Fallback>
      </div>
    </Avatar.Root>
  )
}

const extractInitials = (name: string): string =>
  ((w: string[] = name.trim().split(/\s+/)) =>
    w[0]
      ? w.length < 2
        ? w[0].slice(0, 2)
        : w
            .slice(0, 2)
            .map((s) => s[0])
            .join('')
      : '')().toUpperCase()
