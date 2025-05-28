import type { FC } from 'react'

const SETTINGS_MENU = [
  {
    label: 'Menu',
    href: '/settings/menu'
  }
]

const DrawerMenuRC: FC = () => {
  return (
    <ul className='menu bg-base-200 h-full w-64 p-4 max-xl:pt-[4rem]'>
      <li>
        <a href='/'>Beranda</a>
      </li>
      <li className='menu-title mt-4 uppercase'>Pengaturan</li>
      {SETTINGS_MENU.map((item, i) => (
        <li key={i}>
          <a href={item.href}>{item.label}</a>
        </li>
      ))}
    </ul>
  )
}

export default DrawerMenuRC
