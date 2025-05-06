import type { FC } from 'react'
import CardTemplate from './card'

const LoadingCard: FC = () => {
  return (
    <CardTemplate>
      <div className='grid aspect-[3/4] flex-1 place-content-center lg:aspect-[4/3]'>
        <span className='loading loading-xl text-base-300'></span>
      </div>
    </CardTemplate>
  )
}

export default LoadingCard
