import type { FC } from 'react'

const LoadingCard: FC = () => {
  return (
    <div className='grid aspect-[1/1] w-full place-content-center md:aspect-[16/6]'>
      <span className='loading loading-dots loading-xl text-base-content/20'></span>
    </div>
  )
}

export default LoadingCard
