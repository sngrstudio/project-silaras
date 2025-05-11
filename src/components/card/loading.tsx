import type { FC } from 'react'

const LoadingCard: FC = () => {
  return (
    <div className='grid aspect-[1/1] md:aspect-[16/6] w-full place-content-center'>
      <span className='loading loading-dots loading-xl text-base-content/20'></span>
    </div>
  )
}

export default LoadingCard
