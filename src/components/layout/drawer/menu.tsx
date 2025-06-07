/**
 * @fileoverview Navigation Drawer Menu Component
 *
 * This component renders the main navigation menu within the drawer sidebar,
 * providing access to all major sections of the SILARAS application. It includes
 * role-based navigation with access control, user profile management, and
 * hierarchical menu organization.
 *
 * @features
 * - Role-based menu item visibility and access control
 * - Hierarchical navigation (regions, districts, villages)
 * - User profile section with logout functionality
 * - Settings management for administrators
 * - Dynamic menu item filtering based on user permissions
 * - Responsive design with mobile-optimized interactions
 * - Integration with user session management
 *
 * @navigation
 * - Dashboard: Home and main overview
 * - Regions: Geographic hierarchy navigation
 * - Settings: Administrative configuration (admin only)
 * - Profile: User account management
 *
 * @accessControl
 * - Filters menu items based on user access level
 * - Hides administrative functions from non-admin users
 * - Restricts region access based on user assignments
 * - Provides appropriate fallbacks for unauthorized access
 *
 * @component
 * @example
 * ```tsx
 * <DrawerMenuRC />
 * ```
 *
 * @dependencies
 * - Drawer store for user session state
 * - Astro actions for navigation and logout
 * - Lucide icons for visual indicators
 * - Nanostores for reactive state management
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import type { FC } from 'react'
import { useStore } from '@nanostores/react'
import { $currentUser, setCurrentUser } from './drawer.store'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import { useState, useEffect } from 'react'

// Icons
import HomeIcon from '~icons/lucide/home'
import MapIcon from '~icons/lucide/map'
import SettingsIcon from '~icons/lucide/settings'
import MenuIcon from '~icons/lucide/menu'
import UsersIcon from '~icons/lucide/users'
import UserIcon from '~icons/lucide/user'
import LogOutIcon from '~icons/lucide/log-out'
import BuildingIcon from '~icons/lucide/building'
import MapPinIcon from '~icons/lucide/map-pin'
import TargetIcon from '~icons/lucide/target'

const SETTINGS_MENU = [
  {
    label: 'Setelan Situs',
    href: '/settings/site',
    icon: SettingsIcon
  },
  {
    label: 'Setelan Menu',
    href: '/settings/menu',
    icon: MenuIcon
  },
  {
    label: 'Manajemen Pengguna',
    href: '/settings/users',
    icon: UsersIcon
  }
]

const DrawerMenuRC: FC = () => {
  return (
    <ul className='menu bg-base-200/95 max-xl:border-primary/70 pointer-coarse:menu-lg relative z-[9997] h-full w-64 p-4 backdrop-blur-sm max-xl:border-r-2 max-xl:pt-[4rem] max-md:pointer-coarse:w-[80vw]'>
      <MainMenu />
      <RegionsMenu />
      <SettingsMenu />
      <UserMenu />
    </ul>
  )
}

export default DrawerMenuRC

const MainMenu: FC = () => {
  return (
    <>
      <li>
        <a
          href='/'
          className='group hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
        >
          <HomeIcon className='h-5 w-5 transition-colors duration-200' />
          <span className='font-medium'>Beranda</span>
        </a>
      </li>
    </>
  )
}

const RegionsMenu: FC = () => {
  const user = useStore($currentUser)
  const [userRegion, setUserRegion] = useState<any>(null)
  const [childRegions, setChildRegions] = useState<any[]>([])
  const [targets, setTargets] = useState<any[]>([])

  // Fetch user's region data when component mounts
  useEffect(() => {
    async function fetchUserRegionData() {
      if (!user?.regionId) return

      try {
        const region = await actions.region.getById.orThrow({
          id: user.regionId
        })
        setUserRegion(region)

        // For level 2 (Kader DASHAT), show targets from their assigned DESA region
        if (user.accessLevel === 2 && region) {
          // Level 2 users are assigned to DESA regions, show targets directly from that DESA
          const regionTargets = await actions.region.getTargetsByRegion.orThrow(
            {
              regionId: region.id
            }
          )
          setTargets(regionTargets)
        } else if (region && shouldShowChildRegions(user, region)) {
          // For other levels (3+), get child regions with users
          const children = await actions.region.getByParentIdWithUsers.orThrow({
            parentId: region.id
          })
          setChildRegions(children)
        }
      } catch (error) {
        console.error('Failed to fetch region data:', error)
      }
    }

    fetchUserRegionData()
  }, [user?.regionId])

  if (!user) {
    return <></>
  }

  // Viewers are restricted for now
  if (user.accessLevel === 1) {
    return <></>
  }

  return (
    <>
      <li className='menu-title text-primary/70 mt-6 mb-2 text-xs font-bold tracking-wide uppercase'>
        Tautan Cepat
      </li>

      {/* Super Admin and Admin get link to main kabupaten (only if they don't have a specific region assignment) */}
      {user.accessLevel >= 4 && !user.regionId && (
        <li>
          <a
            href='/region/kotawaringin-timur'
            className='group hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
          >
            <MapIcon className='h-5 w-5 transition-colors duration-200' />
            <span className='font-medium'>Kotawaringin Timur</span>
          </a>
        </li>
      )}

      {/* Users with region assignment get contextual quick links */}
      {user.regionId && userRegion && (
        <>
          {/* Main region link */}
          <li>
            <a
              href={`/region/${userRegion.slug}`}
              className='group hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
            >
              {getRegionIcon(userRegion.type)}
              <span className='font-medium'>{userRegion.name}</span>
            </a>
          </li>

          {/* Child regions listed below as separate menu items (only for regions with users) */}
          {childRegions.length > 0 && (
            <>
              <li className='menu-title text-primary/50 mt-4 mb-2 text-xs font-bold tracking-wide uppercase'>
                {getChildRegionSectionTitle(userRegion.type)}
              </li>
              {childRegions.slice(0, 8).map((region) => (
                <li key={region.id}>
                  <a
                    href={`/region/${region.slug}`}
                    className='group hover:border-primary/20 hover:bg-primary/5 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
                  >
                    {getRegionIcon(region.type)}
                    <span className='font-medium'>{region.name}</span>
                  </a>
                </li>
              ))}
              {childRegions.length > 8 && (
                <li>
                  <a
                    href={`/region/${userRegion.slug}`}
                    className='text-primary/70 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 text-sm font-medium transition-all duration-200'
                  >
                    <span>
                      +{childRegions.length - 8}{' '}
                      {getChildRegionTypeName(userRegion.type)} lainnya...
                    </span>
                  </a>
                </li>
              )}
            </>
          )}

          {/* Targets listed below for level 2 users */}
          {targets.length > 0 && user.accessLevel === 2 && (
            <>
              <li className='menu-title text-primary/50 mt-4 mb-2 text-xs font-bold tracking-wide uppercase'>
                Sasaran Binaan
              </li>
              {targets.map((target) => (
                <li key={target.id}>
                  <a
                    href={`/target/${target.slug}`}
                    className='group hover:border-primary/20 hover:bg-primary/5 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
                  >
                    <TargetIcon className='h-5 w-5 transition-colors duration-200' />
                    <span className='font-medium'>{target.name}</span>
                    <span className='ml-auto text-xs opacity-70'>
                      {getStatusText(target.status)}
                    </span>
                  </a>
                </li>
              ))}
            </>
          )}
        </>
      )}
    </>
  )
}

/**
 * Helper function to determine if child regions should be shown
 */
function shouldShowChildRegions(user: any, region: any): boolean {
  // Level 2 (Kader DASHAT) shows targets instead of child regions
  if (user.accessLevel === 2) return false

  // Level 3 (PLKB Kecamatan) shows child regions (desa/kelurahan)
  if (user.accessLevel === 3 && region.type === 'KECAMATAN') return true

  // Level 4+ (Admin, Super Admin) can see child regions if they have a region assignment
  if (
    user.accessLevel >= 4 &&
    region &&
    (region.type === 'KABUPATEN' || region.type === 'KECAMATAN')
  )
    return true

  return false
}

/**
 * Helper function to get appropriate icon for region type
 */
function getRegionIcon(
  regionType: string,
  className: string = 'h-5 w-5 transition-colors duration-200'
) {
  switch (regionType) {
    case 'KABUPATEN':
      return <BuildingIcon className={className} />
    case 'KECAMATAN':
      return <MapIcon className={className} />
    case 'DESA':
      return <MapPinIcon className={className} />
    default:
      return <MapIcon className={className} />
  }
}

/**
 * Helper function to get section title for child regions
 */
function getChildRegionSectionTitle(parentRegionType: string): string {
  switch (parentRegionType) {
    case 'KABUPATEN':
      return 'Kecamatan'
    case 'KECAMATAN':
      return 'Desa/Kelurahan'
    default:
      return 'Sub Wilayah'
  }
}

/**
 * Helper function to get child region type name for "more" indicator
 */
function getChildRegionTypeName(parentRegionType: string): string {
  switch (parentRegionType) {
    case 'KABUPATEN':
      return 'kecamatan'
    case 'KECAMATAN':
      return 'desa'
    default:
      return 'wilayah'
  }
}

/**
 * Helper function to get status text in Indonesian
 */
function getStatusText(status: string): string {
  switch (status) {
    case 'HAMIL':
      return 'Hamil'
    case 'MENYUSUI':
      return 'Menyusui'
    case 'ANAK-ANAK':
      return 'Anak'
    default:
      return status
  }
}

const SettingsMenu: FC = () => {
  const user = useStore($currentUser)

  if (!user) {
    return <></>
  }

  // Filter menu items based on user access level
  const availableMenuItems = SETTINGS_MENU.filter((item) => {
    // User settings accessible to coordinators (level 3) and above
    if (item.href === '/settings/users') {
      return user.accessLevel >= 3
    }

    // Site and menu settings only for admins (level 4)
    if (item.href === '/settings/site' || item.href === '/settings/menu') {
      return user.accessLevel >= 4
    }

    return false
  })

  // Don't show settings section if user has no access to any settings
  if (availableMenuItems.length === 0) {
    return <></>
  }

  return (
    <>
      {/* Pengaturan Aplikasi */}
      <li className='menu-title text-primary/70 mt-6 mb-2 text-xs font-bold tracking-wide uppercase'>
        Pengaturan Aplikasi
      </li>
      {availableMenuItems.map((item, i) => {
        const IconComponent = item.icon
        return (
          <li key={i}>
            <a
              href={item.href}
              className='group hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
            >
              <IconComponent className='h-5 w-5 transition-colors duration-200' />
              <span className='font-medium'>{item.label}</span>
            </a>
          </li>
        )
      })}
    </>
  )
}

const UserMenu: FC = () => {
  const user = useStore($currentUser)

  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      return
    }

    try {
      await actions.user.auth.logout.orThrow()
      setCurrentUser(undefined)
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) {
    return <></>
  }

  return (
    <>
      <li className='menu-title text-primary/70 mt-auto mb-2 text-xs font-bold tracking-wide uppercase'>
        {user.fullName}
      </li>
      <li>
        <a
          href='/user/profile'
          className='group hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
        >
          <UserIcon className='h-5 w-5 transition-colors duration-200' />
          <span className='font-medium'>Profil Pengguna</span>
        </a>
      </li>
      <li>
        <div
          role='button'
          onClick={handleLogout}
          className='group hover:border-error/30 hover:bg-error/10 hover:text-error flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200'
        >
          <LogOutIcon className='h-5 w-5 transition-colors duration-200' />
          <span className='font-medium'>Logout</span>
        </div>
      </li>
    </>
  )
}
