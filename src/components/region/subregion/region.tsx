import { type FC } from 'react'
import Navigation from './navigation'
import { useStore } from '@nanostores/react'
import { $regions, type Regions } from './region.store'

const RegionRC: FC = () => {
  const regions = useStore($regions)

  if (!regions) {
    return <></>
  }

  return (
    <>
      <RegionCardGrid regions={regions} />
      <Navigation />
    </>
  )
}

export default RegionRC

const RegionCardGrid: FC<{ regions: Regions }> = ({ regions }) => {
  return (
    <div className='grid grid-cols-1 gap-4 p-4 max-sm:-mx-[1.5rem] max-sm:w-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {regions.data.map((region) => (
        <RegionCard key={region.id} region={region} />
      ))}
    </div>
  )
}

const RegionCard: FC<{ region: Regions['data'][number] }> = ({ region }) => {
  const isDesaType = region.type === 'DESA'
  const getSubRegionLabel = () => {
    if (region.type === 'KABUPATEN') return 'Kecamatan'
    if (region.type === 'KECAMATAN') return 'Desa'
    return 'Sub Wilayah'
  }

  return (
    <a
      href={`/region/${region.slug}`}
      className='block rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-200 hover:border-blue-300 hover:shadow-lg'
    >
      <div className='p-6'>
        <h3 className='mb-3 line-clamp-2 text-lg font-semibold text-gray-900'>
          {region.name}
        </h3>

        <div className='space-y-2'>
          {!isDesaType && (
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>
                {getSubRegionLabel()}:
              </span>
              <span className='text-sm font-medium text-blue-600'>
                {region.childRegionCount}
              </span>
            </div>
          )}

          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600'>Jumlah Pasien:</span>
            <span className='text-sm font-medium text-green-600'>
              {region.patientCount}
            </span>
          </div>
        </div>

        <div className='mt-4 border-t border-gray-100 pt-3'>
          <span className='inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800'>
            {region.type}
          </span>
        </div>
      </div>
    </a>
  )
}
