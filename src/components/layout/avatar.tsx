import { type FC, useEffect, useTransition } from 'react'
import { Avatar } from 'radix-ui'
import { useStore } from '@nanostores/react'
import { type UserProfile, $userProfile } from './store'

export const UserAvatar: FC<{ initialData: UserProfile }> = ({
  initialData
}) => {
  const userProfile = useStore($userProfile)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(() => {
      $userProfile.set(initialData)
    })
  }, [initialData])

  return (
    <Avatar.Root asChild>
      <div className='avatar avatar-placeholder'>
        <Avatar.Fallback asChild>
          <div
            className='bg-primary data-[loading=true]:bg-primary/50 data-[loading=true]:skeleton h-[40px] w-[40px] rounded-full p-2 data-[loading=true]:rounded-full'
            data-loading={isPending || userProfile.fullName}
          >
            <span className='text-primary-content text-xs lg:text-base'>
              {extractInitials(userProfile.fullName as string)}
            </span>
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
